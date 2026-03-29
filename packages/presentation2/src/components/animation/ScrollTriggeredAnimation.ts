import { Element } from "../element/Element";
import { Section } from "../section/Section";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";

export class ScrollTriggeredAnimation {
  // Structural relations --
  //
  private elementOrSection_: Element | Section;
  private trigger_: ScrollTrigger;

  // Owned properties --
  //
  private duration_: number = 0;
  private scrollDriven_: boolean = false;

  constructor(options: {
    elementOrSection: Element | Section;
    trigger: ScrollTrigger;
    duration?: number;
    scrollDriven?: boolean;
  }) {
    this.elementOrSection_ = options.elementOrSection;
    this.trigger_ = options.trigger;
    this.duration_ = options.duration ?? 0;
    this.scrollDriven_ = options.scrollDriven ?? false;
  }

  get element(): Element {
    if (!(this.elementOrSection_ instanceof Element)) {
      throw new Error(
        "ScrollTriggeredAnimation.element only valid for Elements but is a Section.",
      );
    }

    return this.elementOrSection_;
  }

  get section(): Section {
    if (this.elementOrSection_ instanceof Element) {
      return this.elementOrSection_.section;
    }
    return this.elementOrSection_;
  }

  get scrollTrigger(): ScrollTrigger {
    return this.trigger_;
  }

  get isScrollDriven(): boolean {
    return this.scrollDriven_;
  }

  get duration(): number {
    return this.duration_;
  }
}
