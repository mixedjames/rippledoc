import type { Layout } from "./Layout";

/**
 * A LayoutPicker selects which layout should be active based on the current
 * physical viewport size.
 *
 * Implement this interface to define custom layout selection logic — for example,
 * switching between landscape and portrait layouts based on the viewport's aspect
 * ratio. The picker is called automatically during layout recalculation whenever
 * the physical viewport changes.
 *
 * The picker receives the current physical dimensions and the full list of
 * available layouts, and must return one of them.
 */
export interface LayoutPicker {
  pickLayout(
    physicalWidth: number,
    physicalHeight: number,
    layouts: readonly Layout[],
  ): Layout;
}
