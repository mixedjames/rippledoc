import { Element } from "../element/Element";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";

export class Pin {
  private element_: Element;
  private scrollTrigger_: ScrollTrigger;

  constructor(options: { element: Element; scrollTrigger: ScrollTrigger }) {
    this.element_ = options.element;
    this.scrollTrigger_ = options.scrollTrigger;
  }

  get element(): Element {
    return this.element_;
  }

  get scrollTrigger(): ScrollTrigger {
    return this.scrollTrigger_;
  }
}
