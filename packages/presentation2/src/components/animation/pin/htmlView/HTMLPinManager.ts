import {
  HTMLElementView,
  HTMLElementViewLinkedClone,
} from "../../../element/htmlView/HTMLElementView";
import { HTMLSectionView } from "../../../section/htmlView/HTMLSectionView";
import { Pin } from "../Pin";

/**
 * Represents the browsers basic Element type.
 *
 * Exists because I made an error in naming elements on my custom DOM and we now have two different
 * Element types in this codebase - the browser's native Element, and our custom Element class.
 */
type DOMElement = globalThis.Element;

/**
 * The number of decimal places to use when setting CSS styles for pinned elements.
 */
const STYLE_PRECISION = 2;

/**
 * A no-op implementation of HTMLPinManager used when there are no pins.
 *
 * Lightweight implementation that allows us to avoid null checks for the common case where there
 * are no pins, while still providing the same API.
 */
export class NullHTMLPinManager {
  private parent_: HTMLElementView | HTMLSectionView;

  constructor(options: { parent: HTMLElementView | HTMLSectionView }) {
    this.parent_ = options.parent;
  }

  get hasPins(): boolean {
    return false;
  }

  disconnect(): void {}

  layout(): void {}

  animatableObjectChanges(): void {}

  /**
   * We must forward these properties, even in the null case, because they are used by the
   * animation subsystem.
   */
  get allowsSubComponentElements(): boolean {
    return this.parent_.allowsSubComponentElements;
  }

  getSubComponentElement(name: string): DOMElement {
    return this.parent_.getSubComponentElement(name);
  }

  get clonedHTMLElement(): HTMLElement {
    throw new Error("NullHTMLPinManager does not have a cloned HTMLElement");
  }
}

export class HTMLPinManager {
  private readonly targetWrapper_: HTMLElement;
  private readonly elementViewLinkedClone_: HTMLElementViewLinkedClone;

  private readonly unsubscribe_: Array<() => void> = [];

  /**
   * Records the cumulative deltaY of all pins applied so far, in *basis coordinates*.
   *
   * The rules for what deltaY should include are as follows:
   * - deltaY is updated when this pin starts/finishes due to the end (bottom) of the trigger being
   *   crossed. (ScrollTrigger is already debounced so this should be reliable even when scrolling
   *   at speed)
   * - As a consequence, it does *not* include the current pin's deltaY & positioning code is
   *   written accordingly.
   */
  private deltaY_: number = 0;

  constructor(options: { parent: HTMLElementView }) {
    this.targetWrapper_ = document.createElement("div");
    this.elementViewLinkedClone_ = options.parent.makeLinkedClone();

    this.buildDOM();
    this.buildPins();
  }

  get hasPins(): boolean {
    return true;
  }

  disconnect(): void {
    this.unsubscribe_.forEach((unsubscribe) => unsubscribe());
    this.unsubscribe_.length = 0;

    // We know it's not null because we always add exactly one child only remove it here
    // so '!' is safe
    this.targetWrapper_.replaceWith(this.targetWrapper_.firstElementChild!);

    this.elementViewLinkedClone_.htmlElement.remove();
  }

  layout(): void {}

  animatableObjectChanges(): void {
    this.updateDOM();
  }

  get allowsSubComponentElements(): boolean {
    return this.elementViewLinkedClone_.allowsSubComponentElements;
  }

  getSubComponentElement(name: string): DOMElement {
    return this.elementViewLinkedClone_.getSubComponentElement(name);
  }

  get clonedHTMLElement(): HTMLElement {
    return this.elementViewLinkedClone_.htmlElement;
  }

  private buildPins(): void {
    const pins = this.elementViewLinkedClone_.elementView.element.pins.slice();

    pins.forEach((pin) => {
      const scrollTrigger = pin.scrollTrigger;

      this.unsubscribe_.push(
        scrollTrigger.on("start", this.pinForward.bind(this, pin)),
        scrollTrigger.on("reverseStart", this.pinReverse.bind(this, pin)),
        scrollTrigger.on("end", this.unpinForward.bind(this, pin)),
        scrollTrigger.on("reverseEnd", this.unpinReverse.bind(this, pin)),
      ); //push
    }); //forEach
  } //buildPins

  private buildDOM(): void {
    // Wrapper element
    //

    this.targetWrapper_.style.position = "absolute";
    this.targetWrapper_.style.top = "0px";
    this.targetWrapper_.style.left = "0px";
    this.targetWrapper_.style.visibility = "visible";
    this.targetWrapper_.classList.add("rdoc-pin-wrapper");

    // This unreadable pair just wraps the target element in the wrapper.
    this.elementViewLinkedClone_.elementView.htmlElement.replaceWith(
      this.targetWrapper_,
    );
    this.targetWrapper_.appendChild(
      this.elementViewLinkedClone_.elementView.htmlElement,
    );

    this.updateDOM();
  }

  private updateDOM(): void {
    // Make sure the linked clone is up to date, in case the target DOM has been modified since the
    // last time we built, and sync the linked clone with target DOM.
    this.elementViewLinkedClone_.htmlElement.remove();
    this.elementViewLinkedClone_.update();

    // Set the clone up for pinning
    const clone = this.elementViewLinkedClone_.htmlElement;
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.classList.add("rdoc-pin-clone");

    const pinHTMLContainer =
      this.elementViewLinkedClone_.elementView.presentationView.htmlPins;
    pinHTMLContainer.appendChild(clone);
  }

  private incrementDeltaY(pin: Pin): void {
    this.deltaY_ += pin.scrollTrigger.deltaY;
  }

  private decrementDeltaY(pin: Pin): void {
    this.deltaY_ -= pin.scrollTrigger.deltaY;
  }

  /**
   * Utility property to get the current scale factor from the presentation view.
   * Only exists to make the methods below more readable - it is *not* intended to be a general
   * purpose API and should not be used outside of this class.
   */
  private get scale(): number {
    return this.elementViewLinkedClone_.elementView.presentationView
      .physicalDimensions.scale;
  }

  private pinForward(pin: Pin): void {
    this.positionClone(pin);

    this.elementViewLinkedClone_.show();
    this.elementViewLinkedClone_.elementView.hide();
  }

  private pinReverse(pin: Pin): void {
    // Order is important here: positionClone assumes that deltaY does not include the current pin's
    // deltaY, so we must decrement before positioning
    this.decrementDeltaY(pin);
    this.positionClone(pin);

    this.elementViewLinkedClone_.show();
    this.elementViewLinkedClone_.elementView.hide();
  }

  private unpinForward(pin: Pin): void {
    // 1. We're careful to position the target element based on the perfect position as per the
    //    scroll trigger, rather than the current scroll position. Scrolling at speed might have
    //    caused the end trigger to have been missed leading to the target element being in the
    //    wrong place, and this would cause a jarring jump when the pin ends.
    //
    // 2. We assume that deltaY reflects any pins that have occured before, but *not* the current
    //    pin. (This doesn't actually matter here but we do so for consistency with positionClone
    //    and the general rules for deltaY)

    const dy = this.scale * (this.deltaY_ + pin.scrollTrigger.deltaY);

    this.targetWrapper_.style.transform = `translateY(${dy.toFixed(STYLE_PRECISION)}px)`;
    this.targetWrapper_.style.zIndex = "1000";

    this.elementViewLinkedClone_.elementView.show();
    this.elementViewLinkedClone_.hide();

    this.incrementDeltaY(pin);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private unpinReverse(pin: Pin): void {
    const dy = this.scale * this.deltaY_;

    this.targetWrapper_.style.transform = `translateY(${dy.toFixed(STYLE_PRECISION)}px)`;

    this.elementViewLinkedClone_.elementView.show();
    this.elementViewLinkedClone_.hide();
  }

  /**
   * Positions the clone element based on the perfect position as per the scroll trigger.
   *
   * Important notes: (read carefully before messing)
   * - We assume that deltaY reflects any pins that have occured before, but *not* the current pin.
   *   (This is not because of some magical primacy of this but because consistency is essential)
   * - We calculate the bounding rect based on the scale and the element size in basis coords.
   *   We *do not* use DOM APIs to get the bounding rect - pinning must compose with animations
   *   which may use transforms - a key idea is that animations are a visual concept only and they
   *   do not affect the "real" position of elements for the purpose of pinning.
   */
  private positionClone(pin: Pin): void {
    const { scale, tx } =
      this.elementViewLinkedClone_.elementView.presentationView
        .physicalDimensions;

    const el = this.elementViewLinkedClone_.elementView.element;

    const rect = {
      // Horizontal position is unaffected by pinning but must consider scale and viewport
      // translation
      left: el.left * scale + tx,

      // Vertical position is fiddly:
      // - It must consider scale
      // - It must consider any previous pins (deltaY)
      // - It must consider the position of the element in the viewport as pinning begins
      top: scale * (this.deltaY_ + el.top - pin.scrollTrigger.start),

      // Size must consider scale but is unaffected by pinning/translation
      width: el.width * scale,
      height: el.height * scale,
    };

    const clone = this.elementViewLinkedClone_.htmlElement;
    clone.style.top = `${rect.top.toFixed(STYLE_PRECISION)}px`;
    clone.style.left = `${rect.left.toFixed(STYLE_PRECISION)}px`;
    clone.style.width = `${rect.width.toFixed(STYLE_PRECISION)}px`;
    clone.style.height = `${rect.height.toFixed(STYLE_PRECISION)}px`;
  }
}
