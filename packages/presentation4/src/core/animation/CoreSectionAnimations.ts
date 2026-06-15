import type { Section } from "../../clientAPI/Section";
import type { SectionAnimations } from "../../clientAPI/animation/SectionAnimations";
import type { KeyFrameAnimation, KeyFrameAnimationOptions } from "../../clientAPI/animation/KeyFrameAnimation";
import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";
import type { KeyFrameAnimationMemento } from "../../clientAPI/serialize/PresentationMemento";
import type { EventContext } from "../EventContext";
import { CoreKeyFrameAnimation } from "./CoreKeyFrameAnimation";

export class CoreSectionAnimations implements SectionAnimations {
  private readonly section_: Section;
  private readonly eventContext_: EventContext;
  private readonly keyFrameAnimations_: CoreKeyFrameAnimation[] = [];

  constructor(section: Section, eventContext: EventContext) {
    this.section_ = section;
    this.eventContext_ = eventContext;
  }

  get keyFrameAnimations(): readonly KeyFrameAnimation[] {
    return this.keyFrameAnimations_;
  }

  addKeyFrameAnimation(options: KeyFrameAnimationOptions): KeyFrameAnimation {
    const animation = new CoreKeyFrameAnimation(options, this.eventContext_);
    this.keyFrameAnimations_.push(animation);
    this.eventContext_.emit("section:animationAdded", {
      section: this.section_,
      animation,
    });
    return animation;
  }

  toMemento(
    triggerIndex: ReadonlyMap<ScrollTrigger, number>,
  ): readonly KeyFrameAnimationMemento[] {
    return this.keyFrameAnimations_.map((a) => a.toMemento(triggerIndex));
  }
}
