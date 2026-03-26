import { ElementBuilder } from "../element/ElementBuilder";

/**
 *
 */
export class PinBuilder {
  private element_: ElementBuilder;
  private scrollTrigger_: string | null = null;

  constructor(options: { element: ElementBuilder }) {
    this.element_ = options.element;
  }

  get element(): ElementBuilder {
    return this.element_;
  }

  get scrollTrigger(): string {
    if (!this.scrollTrigger_) {
      throw new Error("Pin must have a scroll trigger to get it.");
    }

    return this.scrollTrigger_;
  }

  set scrollTrigger(value: string) {
    this.scrollTrigger_ = value;
  }
}
