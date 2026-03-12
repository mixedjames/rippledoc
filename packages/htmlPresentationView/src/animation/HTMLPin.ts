import { Element, Pin, ScrollTrigger } from "@rippledoc/presentation";

export class HTMLPin implements Pin {
  private readonly element_: Element;
  private readonly scrollTrigger_: ScrollTrigger;

  constructor(element: Element, options: { trigger: ScrollTrigger }) {
    this.element_ = element;
    this.scrollTrigger_ = options.trigger;

    this.scrollTrigger_.on("start", () => {
      console.log(`Pin start for element ${this.element_.name}`);
    });

    this.scrollTrigger_.on("end", () => {
      console.log(`Pin end for element ${this.element_.name}`);
    });

    this.scrollTrigger_.on("reverseStart", () => {
      console.log(`Pin reverse start for element ${this.element_.name}`);
    });

    this.scrollTrigger_.on("reverseEnd", () => {
      console.log(`Pin reverse end for element ${this.element_.name}`);
    });
  }

  get scrollTrigger(): ScrollTrigger {
    return this.scrollTrigger_;
  }

  get pinnedElement(): Element {
    return this.element_;
  }
}
