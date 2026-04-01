import { Pin } from "../Pin";
import {
  HTMLElementView,
  HTMLElementViewLinkedClone,
} from "../../../element/htmlView/HTMLElementView";

/**
 * Represents the browsers basic Element type.
 *
 * Exists because I made an error in naming elements on my custom DOM and we now have two different
 * Element types in this codebase - the browser's native Element, and our custom Element class.
 */
type DOMElement = globalThis.Element;

const STYLE_PRECISION = 2;

/**
 *
 */
export class HTMLPinView {
  private readonly pin_: Pin;
  private readonly elementViewLinkedClone_: HTMLElementViewLinkedClone;

  private readonly unsubscribe_: Array<() => void> = [];

  private clone_!: HTMLElement;
  private target_!: HTMLElement;

  constructor(options: { pin: Pin; elementView: HTMLElementView }) {
    this.pin_ = options.pin;
    //this.elementView_ = options.elementView;
    this.elementViewLinkedClone_ = options.elementView.makeLinkedClone();

    this.buildDOM();
    this.attachEventListeners();
  }

  disconnect(): void {
    this.unsubscribe_.forEach((unsubscribe) => unsubscribe());
    this.unsubscribe_.length = 0;

    this.clone_.remove();
  }

  layout(): void {
    // FIXME: need to react to layout changes
  }

  get clonedElement(): HTMLElement {
    return this.clone_;
  }

  elementViewModified(): void {
    this.clone_.remove();
    this.buildDOM();
  }

  /**
   * See Element.allowsSubComponentElements
   */
  get allowsSubComponentElements(): boolean {
    return this.elementViewLinkedClone_.allowsSubComponentElements;
  }

  getSubComponentElement(name: string): DOMElement {
    return this.elementViewLinkedClone_.getSubComponentElement(name);
  }

  private buildDOM(): void {
    // Make sure the linked clone is up to date, in case the target DOM has been modified since the
    // last time we built.
    this.elementViewLinkedClone_.update();

    // Placeholder
    //
    this.target_ = this.elementViewLinkedClone_.elementView.htmlElement;

    // Clone
    //
    this.clone_ = this.elementViewLinkedClone_.htmlElement;
    this.clone_.style.position = "absolute";
    this.clone_.style.visibility = "hidden";
    this.clone_.classList.add("rdoc-pin-clone");
    this.elementViewLinkedClone_.elementView.presentationView.htmlPins.appendChild(
      this.clone_,
    );
  }

  private attachEventListeners(): void {
    const scrollTrigger = this.pin_.scrollTrigger;

    this.unsubscribe_.push(
      scrollTrigger.on("start", () => {
        this.pinForward();
      }),
      scrollTrigger.on("reverseStart", () => {
        this.pinReverse();
      }),
      scrollTrigger.on("end", () => {
        this.unpinForward();
      }),
      scrollTrigger.on("reverseEnd", () => {
        this.unpinReverse();
      }),
    );
  }

  private pinForward(): void {
    this.positionClone();

    this.clone_.style.visibility = "visible";
    this.target_.style.visibility = "hidden";
  }

  private pinReverse(): void {
    this.positionClone();

    this.clone_.style.visibility = "visible";
    this.target_.style.visibility = "hidden";
  }

  private unpinForward(): void {
    // We're carefull to position the target element based on the perfect position as per the scroll
    // trigger, rather than the current scroll position. Scrolling at speed might have caused the
    // end trigger to have been missed.
    //
    const scale =
      this.elementViewLinkedClone_.elementView.presentationView
        .physicalDimensions.scale;
    const dy =
      scale * (this.pin_.scrollTrigger.end - this.pin_.scrollTrigger.start);

    this.target_.style.transform = `translateY(${dy.toFixed(STYLE_PRECISION)}px)`;
    this.target_.style.zIndex = "1000";

    this.target_.style.visibility = "visible";
    this.clone_.style.visibility = "hidden";
  }

  private unpinReverse(): void {
    this.target_.style.transform = `translateY(0px)`;

    this.target_.style.visibility = "visible";
    this.clone_.style.visibility = "hidden";
  }

  private positionClone(): void {
    const targetRect = this.target_.getBoundingClientRect();

    const scale =
      this.elementViewLinkedClone_.elementView.presentationView
        .physicalDimensions.scale;
    const top =
      scale *
      (this.elementViewLinkedClone_.elementView.element.top -
        this.pin_.scrollTrigger.start);
    const left = targetRect.left;

    this.clone_.style.top = `${top.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.left = `${left.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.width = `${targetRect.width.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.height = `${targetRect.height.toFixed(STYLE_PRECISION)}px`;
  }
}
