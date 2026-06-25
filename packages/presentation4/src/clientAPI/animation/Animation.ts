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

  /** Replace the scroll trigger. Emits animation:triggerChanged. */
  setTrigger(trigger: ScrollTrigger): void;

  /** Replace the duration in milliseconds. Emits animation:durationChanged. */
  setDuration(ms: number): void;

  /**
   * Switch between scroll-driven and time-based mode.
   * Emits animation:scrollDrivenChanged.
   */
  setScrollDriven(driven: boolean): void;
}
