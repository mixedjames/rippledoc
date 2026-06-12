import type { Anchor } from "./Anchor";

/**
 * A complete set of anchors describing the geometry of one object on both axes.
 *
 * Every anchored object exposes its six anchors through a single XYAnchors bag
 * rather than as flat properties. This keeps the object's own interface focused
 * on what the object *is*, while geometry is clearly grouped in one place.
 *
 * All six anchors are always present — there are no nulls. On any given axis,
 * exactly two of the three values are independently constrained; the third is
 * derived from the other two. All three are still readable.
 */
export interface XYAnchors {
  get left(): Anchor;
  get right(): Anchor;
  get width(): Anchor;
  get top(): Anchor;
  get bottom(): Anchor;
  get height(): Anchor;
}
