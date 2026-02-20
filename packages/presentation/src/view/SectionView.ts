import type { ScrollTriggerInternal } from "../scrollTrigger/ScrollTriggerInternal";

/**
 * View abstraction for a section.
 *
 * Concrete implementations are responsible for realising and laying out
 * the visual representation of a {@link Section}.
 */
export interface SectionView {
  /** Create any underlying DOM or rendering structures. */
  realise(): void;

  /** Apply layout calculations and update the view. */
  layout(): void;

  /**
   * Register scroll triggers associated with this section.
   *
   * Implementations may use this to prepare any trigger-specific
   * visualisation or runtime behaviour.
   */
  registerScrollTriggers(triggers: readonly ScrollTriggerInternal[]): void;
}
