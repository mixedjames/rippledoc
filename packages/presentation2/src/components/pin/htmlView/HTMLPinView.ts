import { Pin } from "../Pin";
import { HTMLElementView } from "../../element/htmlView/HTMLElementView";

const STYLE_PRECISION = 2;

/**
 *
 */
export class HTMLPinView {
  private readonly pin_: Pin;
  private readonly elementView_: HTMLElementView;

  private readonly unsubscribe_: Array<() => void> = [];

  private clone_!: HTMLElement;
  private target_!: HTMLElement;

  constructor(options: { pin: Pin; elementView: HTMLElementView }) {
    this.pin_ = options.pin;
    this.elementView_ = options.elementView;

    this.buildDOM();
    this.attachEventListeners();
  }

  disconnect(): void {
    this.unsubscribe_.forEach((unsubscribe) => unsubscribe());
    this.unsubscribe_.length = 0;

    this.clone_.remove();
  }

  private buildDOM(): void {
    // Placeholder
    //
    this.target_ = this.elementView_.htmlElement;

    // Clone
    //
    this.clone_ = this.elementView_.htmlElement.cloneNode(true) as HTMLElement;
    this.clone_.style.position = "absolute";
    this.clone_.style.visibility = "hidden";
    this.clone_.classList.add("rdoc-pin-clone");
    this.elementView_.presentationView.htmlPins.appendChild(this.clone_);
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
    const scale = this.elementView_.presentationView.physicalDimensions.scale;
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

    //const top = targetRect.top - presentationRect.top;
    const scale = this.elementView_.presentationView.physicalDimensions.scale;
    const top =
      scale * (this.elementView_.element.top - this.pin_.scrollTrigger.start);
    const left = targetRect.left;

    this.clone_.style.top = `${top.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.left = `${left.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.width = `${targetRect.width.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.height = `${targetRect.height.toFixed(STYLE_PRECISION)}px`;
  }
}
