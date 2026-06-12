import type { LayoutTransform } from "./LayoutTransform";

/**
 * ElementView is the view-side interface for a single element.
 *
 * All element types (markdown, bitmap image, SVG) share this interface — the
 * type-specific behaviour is determined at creation time by which SectionView
 * factory method was called. Once created, an element view is treated uniformly
 * by the model.
 */
export interface ElementView {
  /** Apply the current layout transform. Called by the model on every layout pass. */
  layout(transform: LayoutTransform): void;

  /** Tear down this view. Called by the model before discarding it. */
  destroy(): void;
}
