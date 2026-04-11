import { Element } from "../../element/Element";
import { ScrollTrigger } from "../../scrollTrigger/ScrollTrigger";
import { Section } from "../../section/Section";
import { ScrollTriggeredAnimation } from "../ScrollTriggeredAnimation";
import { KeyFrame } from "../keyFrameAnimation/KeyFrame";

/**
 *
 */
export class PathTrackerAnimation extends ScrollTriggeredAnimation {
  // Owned properties --
  //
  private keyFrames_: KeyFrame[] = [];

  constructor(options: {
    elementOrSection: Element | Section;
    trigger: ScrollTrigger;
    keyFrames: KeyFrame[];
    duration: number;
    scrollDriven?: boolean;
    subComponentTarget?: string;
  }) {
    super(options);

    this.keyFrames_ = options.keyFrames;
  }

  get keyFrames(): readonly KeyFrame[] {
    return this.keyFrames_;
  }
}
