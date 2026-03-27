import { Element } from "../element/Element";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { KeyFrame } from "./KeyFrame";

export class Animation {
  // Structural relations --
  //
  private element_: Element;
  private trigger_: ScrollTrigger;

  // Owned properties --
  //
  private keyFrames_: KeyFrame[] = [];

  private duration_: number = 0;

  constructor(options: {
    element: Element;
    trigger: ScrollTrigger;
    keyFrames: KeyFrame[];
    duration: number;
  }) {
    this.element_ = options.element;
    this.trigger_ = options.trigger;
    this.keyFrames_ = options.keyFrames;
    this.duration_ = options.duration;
  }

  get element(): Element {
    return this.element_;
  }

  get trigger(): ScrollTrigger {
    return this.trigger_;
  }

  get keyFrames(): readonly KeyFrame[] {
    return this.keyFrames_;
  }

  get isScrollDriven(): boolean {
    return this.duration_ < 0;
  }

  get duration(): number {
    return this.duration_;
  }
}
