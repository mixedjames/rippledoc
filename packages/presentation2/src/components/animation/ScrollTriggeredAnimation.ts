import { Element } from "../element/Element";
import { Section } from "../section/Section";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";

/**
 * A ScrollTriggeredAnimation represents some sort of dynamic visual effect that is:
 * - Driven by scrolling the presentation (& coupled to a ScrollTrigger)
 * - Connected to an animatable element: either an Element or Section currently
 *
 * ## Scroll-Driven Animation
 * We make a distinction between two concepts:
 * 1. What triggers an animation? (always a ScrollTrigger)
 * 2. What drives the animation? (can be time or scrolling)
 *
 * This is represented by the `.isScrollDriven` property.
 */
export class ScrollTriggeredAnimation {
  // Structural relations --
  //
  private elementOrSection_: Element | Section;
  private trigger_: ScrollTrigger;

  private subComponentTarget_: string = "";

  // Owned properties --
  //
  private duration_: number = 0;
  private scrollDriven_: boolean = false;

  constructor(options: {
    elementOrSection: Element | Section;
    trigger: ScrollTrigger;
    duration?: number;
    scrollDriven?: boolean;
    subComponentTarget?: string;
  }) {
    this.elementOrSection_ = options.elementOrSection;
    this.trigger_ = options.trigger;
    this.duration_ = options.duration ?? 0;
    this.scrollDriven_ = options.scrollDriven ?? false;
    this.subComponentTarget_ = options.subComponentTarget ?? "";
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

  get subComponentTarget(): string {
    return this.subComponentTarget_;
  }

  get hasSubComponentTarget(): boolean {
    return this.subComponentTarget_.trim().length > 0;
  }
}
