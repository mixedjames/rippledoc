import type { LayoutTransform } from "./LayoutTransform";

/**
 * ElementView is the view-side interface for a single element.
 *
 * All element types (markdown, bitmap image, SVG) share this interface — the
 * type-specific behaviour is determined at creation time by which SectionView
 * factory method was called. Once created, an element view is treated uniformly
 * by the model.
 *
 * ## Content-dependent dimension lifecycle
 *
 * When an element's owner reports `contentDependentDimension !== 'none'`, the
 * model drives two extra phases before the normal layout pass:
 *
 *   1. `applyConstrainedDimension(transform)` — write phase. Apply only the
 *      known (non-auto) dimension to the view so the browser can determine the
 *      content size. Called for every content-dependent element before any
 *      measurement begins, preventing read-write interleaving reflows.
 *
 *   2. `measureAndReport()` — read phase. Measure the content size from the DOM
 *      and call `owner.notifyMeasuredSize(size)` to feed it back into the anchor
 *      system. Called after all `applyConstrainedDimension` calls complete.
 *
 * For non-content-dependent elements these methods are no-ops.
 */
export interface ElementView {
  /** Apply the current layout transform. Called by the model on every layout pass. */
  layout(transform: LayoutTransform): void;

  /**
   * Write phase of content-dependent layout: apply the constrained dimension
   * only, leaving the auto dimension unsized so the browser can flow content.
   * No-op for non-content-dependent elements.
   */
  applyConstrainedDimension(transform: LayoutTransform): void;

  /**
   * Read phase of content-dependent layout: measure the content size and call
   * `owner.notifyMeasuredSize(size)` with the result in virtual coordinates.
   * No-op for non-content-dependent elements.
   */
  measureAndReport(): void;

  /**
   * Tear down this view.
   * See PresentationView.destroy() for the full view ownership contract.
   */
  destroy(): void;
}
