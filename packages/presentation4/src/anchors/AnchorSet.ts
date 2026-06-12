import type { AnchorExpression } from "./Anchor";

/**
 * Descriptor passed to setHorizontalAnchors / setVerticalAnchors.
 *
 * Exactly two of the three properties must be provided — the 2-of-3 rule.
 * The third is derived automatically. All properties are optional so that
 * TypeScript accepts any combination; the constraint-count check is enforced
 * at runtime by AnchoredObjectBase.setAxis_.
 */
export interface HorizontalAnchorSet {
  left?: AnchorExpression;
  right?: AnchorExpression;
  width?: AnchorExpression;
}

export interface VerticalAnchorSet {
  top?: AnchorExpression;
  bottom?: AnchorExpression;
  height?: AnchorExpression;
}
