import type {
  KeyFrameAnimation,
  KeyFrameAnimationOptions,
} from "./KeyFrameAnimation";

/**
 * The animation bag exposed on a Section via section.animations.
 *
 * Sections support keyframe animations (e.g. background parallax effects).
 * They cannot be pinned — pinning is element-only.
 */
export interface SectionAnimations {
  get keyFrameAnimations(): readonly KeyFrameAnimation[];

  addKeyFrameAnimation(options: KeyFrameAnimationOptions): KeyFrameAnimation;
}
