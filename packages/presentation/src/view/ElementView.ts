import { ContentDependentDimension } from "../model/Element";
import type { ScrollTriggerInternal } from "../scrollTrigger/ScrollTriggerInternal";

/**
 * View abstraction for an element.
 *
 * Concrete implementations are responsible for realising and laying out
 * the visual representation of a {@link Element}.
 */
export interface ElementView {
  /** Create any underlying DOM or rendering structures. */
  realise(): void;

  /** Apply layout calculations and update the view. */
  layout(): void;

  /**
   * Get the content-dependent dimension value for this element.
   *
   * @param d The content-dependent dimension type.
   * @returns The value of the content-dependent dimension.
   */
  getContentDependentDimension(d: ContentDependentDimension): number;

  /**
   * Register scroll triggers associated with this element.
   *
   * Implementations may use this to prepare any trigger-specific
   * visualisation or runtime behaviour.
   */
  registerScrollTriggers(triggers: readonly ScrollTriggerInternal[]): void;
}
