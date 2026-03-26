import { HTMLPresentationViewRoot } from "../../presentation/htmlView/HTMLPresentationViewRoot";
import { Pin } from "../../pin/Pin";
import { HTMLPinView } from "./HTMLPinView";
import { HTMLElementView } from "../../element/htmlView/HTMLElementView";

type PinPair = {
  pin: Pin;
  elementView: HTMLElementView;
};

export class HTMLPinManager {
  private readonly htmlPresentationRoot_: HTMLPresentationViewRoot;
  private readonly cachedPins_: PinPair[] = [];
  private readonly pinViews_: HTMLPinView[] = [];

  constructor(options: { htmlPresentationRoot: HTMLPresentationViewRoot }) {
    this.htmlPresentationRoot_ = options.htmlPresentationRoot;

    this.buildPinCache();
    this.attachPinViews();
  }

  private buildPinCache(): void {
    this.cachedPins_.length = 0;

    // FIXME: We need a better way to collate pins from the presentation.
    this.htmlPresentationRoot_.sections.forEach((section) => {
      section.elementViews.forEach((elementView) => {
        elementView.element.pins.forEach((pin) => {
          this.cachedPins_.push({ pin, elementView });
        });
      });
    });
  }

  private attachPinViews(): void {
    this.cachedPins_.forEach(({ pin, elementView }) => {
      this.pinViews_.push(new HTMLPinView({ pin, elementView }));
    });
  }
}
