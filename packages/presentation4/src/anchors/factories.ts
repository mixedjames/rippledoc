import type { Anchor } from "./Anchor";
import { ConstantAnchorExpression } from "./expressions/ConstantAnchorExpression";
import { OffsetAnchorExpression } from "./expressions/OffsetAnchorExpression";
import { FractionAnchorExpression } from "./expressions/FractionAnchorExpression";

/** A fixed numeric value. */
export function constant(value: number): ConstantAnchorExpression {
  return new ConstantAnchorExpression(value);
}

/** `base.value + offset` — tracks `base` as it changes. */
export function offsetFrom(
  anchor: Anchor,
  offset: number,
): OffsetAnchorExpression {
  return new OffsetAnchorExpression(anchor, offset);
}

/** `base.value * fraction` — tracks `base` as it changes. */
export function fractionOf(
  anchor: Anchor,
  fraction: number,
): FractionAnchorExpression {
  return new FractionAnchorExpression(anchor, fraction);
}
