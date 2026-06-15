import type { Element } from "../../clientAPI/Element";
import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";
import type { ElementAnimations } from "../../clientAPI/animation/ElementAnimations";
import type { KeyFrameAnimation, KeyFrameAnimationOptions } from "../../clientAPI/animation/KeyFrameAnimation";
import type { Pin } from "../../clientAPI/animation/Pin";
import type {
  KeyFrameAnimationMemento,
  PinMemento,
} from "../../clientAPI/serialize/PresentationMemento";
import type { EventContext } from "../EventContext";
import { CoreKeyFrameAnimation } from "./CoreKeyFrameAnimation";
import { CorePin } from "./CorePin";

export class CoreElementAnimations implements ElementAnimations {
  private readonly element_: Element;
  private readonly eventContext_: EventContext;
  private readonly pins_: CorePin[] = [];
  private readonly keyFrameAnimations_: CoreKeyFrameAnimation[] = [];

  constructor(element: Element, eventContext: EventContext) {
    this.element_ = element;
    this.eventContext_ = eventContext;
  }

  get pins(): readonly Pin[] {
    return this.pins_;
  }

  get keyFrameAnimations(): readonly KeyFrameAnimation[] {
    return this.keyFrameAnimations_;
  }

  addPin(trigger: ScrollTrigger): Pin {
    const pin = new CorePin(trigger);
    this.pins_.push(pin);
    this.eventContext_.emit("element:pinAdded", {
      element: this.element_,
      pin,
    });
    return pin;
  }

  addKeyFrameAnimation(options: KeyFrameAnimationOptions): KeyFrameAnimation {
    const animation = new CoreKeyFrameAnimation(options, this.eventContext_);
    this.keyFrameAnimations_.push(animation);
    this.eventContext_.emit("element:animationAdded", {
      element: this.element_,
      animation,
    });
    return animation;
  }

  toMemento(triggerIndex: ReadonlyMap<ScrollTrigger, number>): {
    readonly keyFrameAnimations: readonly KeyFrameAnimationMemento[];
    readonly pins: readonly PinMemento[];
  } {
    return {
      keyFrameAnimations: this.keyFrameAnimations_.map((a) => a.toMemento(triggerIndex)),
      pins: this.pins_.map((p) => p.toMemento(triggerIndex)),
    };
  }
}
