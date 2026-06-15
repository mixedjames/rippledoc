import type { ScrollTrigger } from "../ScrollTrigger";

/**
 * Base interface for all scroll-triggered animations.
 *
 * Every animation is associated with a ScrollTrigger that defines when it is
 * active, a duration (in ms), and a flag that distinguishes two driving modes:
 *
 *   isScrollDriven = false  — the trigger fires the animation as a time-based
 *                             CSS transition; scroll just starts/stops it.
 *   isScrollDriven = true   — the scroll position directly controls the
 *                             animation's current time (scrubbing).
 */
export interface Animation {
  get trigger(): ScrollTrigger;
  get duration(): number;
  get isScrollDriven(): boolean;
}
