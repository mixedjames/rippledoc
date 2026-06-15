import type { ScrollTrigger } from "../ScrollTrigger";
import type { SectionAnimations } from "./SectionAnimations";
import type { Pin } from "./Pin";

/**
 * The animation bag exposed on an Element via element.animations.
 *
 * Extends SectionAnimations with pinning support — elements can be pinned to
 * the viewport while a scroll trigger is active, whereas sections cannot.
 */
export interface ElementAnimations extends SectionAnimations {
  get pins(): readonly Pin[];

  addPin(trigger: ScrollTrigger): Pin;
}
