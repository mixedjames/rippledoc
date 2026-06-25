import type { ScrollTrigger } from "../ScrollTrigger";
import type { Animation } from "./Animation";
import type { KeyFrame } from "./KeyFrame";
import type { SubComponentTarget } from "./SubComponentTarget";

/**
 * An animation that interpolates a set of named properties over keyframes.
 *
 * KeyFrameAnimation covers CSS-animatable properties (opacity, transform,
 * backgroundPosition, stroke tracing). The view chooses the mechanism —
 * typically the Web Animation API — entirely transparently.
 *
 * ## Sub-component targeting
 * When hasTarget is true, the animation applies to a named sub-element inside
 * an SVG image rather than to the element itself. Check hasTarget before
 * reading target; target throws if there is no sub-component.
 */
export interface KeyFrameAnimation extends Animation {
  get keyFrames(): readonly KeyFrame[];

  /**
   * Replace the full set of keyframes. Emits animation:keyFramesChanged so
   * the view can rebuild its CSS animation.
   */
  setKeyFrames(frames: readonly KeyFrame[]): void;

  /** True when this animation targets a sub-component of an SVG element. */
  get hasTarget(): boolean;

  /**
   * The sub-component this animation applies to.
   * Throws if hasTarget is false.
   */
  get target(): SubComponentTarget;
}

/** Options supplied when adding a keyframe animation. */
export type KeyFrameAnimationOptions = {
  trigger: ScrollTrigger;
  keyFrames: readonly KeyFrame[];
  duration: number;
  scrollDriven?: boolean;
  /** Omit to animate the element itself; supply to animate an SVG sub-component. */
  target?: SubComponentTarget;
};
