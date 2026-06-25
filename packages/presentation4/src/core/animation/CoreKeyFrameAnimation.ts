import type {
  KeyFrameAnimation,
  KeyFrameAnimationOptions,
} from "../../clientAPI/animation/KeyFrameAnimation";
import type { KeyFrame } from "../../clientAPI/animation/KeyFrame";
import type { SubComponentTarget } from "../../clientAPI/animation/SubComponentTarget";
import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";
import type { KeyFrameAnimationMemento } from "../../clientAPI/serialize/PresentationMemento";
import type { EventContext } from "../EventContext";

export class CoreKeyFrameAnimation implements KeyFrameAnimation {
  private trigger_: ScrollTrigger;
  private keyFrames_: readonly KeyFrame[];
  private duration_: number;
  private isScrollDriven_: boolean;
  private target_: SubComponentTarget | null;
  private readonly eventContext_: EventContext;

  constructor(options: KeyFrameAnimationOptions, eventContext: EventContext) {
    this.trigger_ = options.trigger;
    this.keyFrames_ = [...options.keyFrames];
    this.duration_ = options.duration;
    this.isScrollDriven_ = options.scrollDriven ?? false;
    this.target_ = options.target ?? null;
    this.eventContext_ = eventContext;
  }

  get trigger(): ScrollTrigger {
    return this.trigger_;
  }

  get duration(): number {
    return this.duration_;
  }

  get isScrollDriven(): boolean {
    return this.isScrollDriven_;
  }

  get keyFrames(): readonly KeyFrame[] {
    return this.keyFrames_;
  }

  setKeyFrames(frames: readonly KeyFrame[]): void {
    this.keyFrames_ = [...frames];
    this.eventContext_.emit("animation:keyFramesChanged", { animation: this });
  }

  setTrigger(trigger: ScrollTrigger): void {
    this.trigger_ = trigger;
    this.eventContext_.emit("animation:triggerChanged", { animation: this });
  }

  setDuration(ms: number): void {
    this.duration_ = ms;
    this.eventContext_.emit("animation:durationChanged", { animation: this });
  }

  setScrollDriven(driven: boolean): void {
    this.isScrollDriven_ = driven;
    this.eventContext_.emit("animation:scrollDrivenChanged", {
      animation: this,
    });
  }

  get hasTarget(): boolean {
    return this.target_ !== null;
  }

  get target(): SubComponentTarget {
    if (this.target_ === null) {
      throw new Error(
        "KeyFrameAnimation.target: no sub-component target set. Check hasTarget first.",
      );
    }
    return this.target_;
  }

  setTarget(target: SubComponentTarget): void {
    this.target_ = target;
    this.eventContext_.emit("animation:targetChanged", { animation: this });
  }

  clearTarget(): void {
    this.target_ = null;
    this.eventContext_.emit("animation:targetChanged", { animation: this });
  }

  toMemento(
    triggerIndex: ReadonlyMap<ScrollTrigger, number>,
  ): KeyFrameAnimationMemento {
    const idx = triggerIndex.get(this.trigger_);
    if (idx === undefined) {
      throw new Error(
        "CoreKeyFrameAnimation.toMemento: trigger not registered in this presentation.",
      );
    }
    return {
      triggerIndex: idx,
      keyFrames: this.keyFrames_,
      duration: this.duration_,
      isScrollDriven: this.isScrollDriven_,
      ...(this.target_ !== null ? { target: this.target_.selector } : {}),
    };
  }
}
