import type { Anchor } from "./Anchor";
import {
  ConstantAnchorExpression,
  FractionAnchorExpression,
  HorizontalCenterAnchorExpression,
  OffsetAnchorExpression,
  VerticalCenterAnchorExpression,
} from "./expressions/index";
import type { XAnchoredObject, YAnchoredObject } from "./AnchoredObject";

export function constant(value: number): ConstantAnchorExpression {
  return new ConstantAnchorExpression(value, true);
}

export function immutableConstant(value: number): ConstantAnchorExpression {
  return new ConstantAnchorExpression(value, false);
}

export function offsetFrom(
  anchor: Anchor,
  offset: number,
): OffsetAnchorExpression {
  return new OffsetAnchorExpression(anchor, offset);
}

export function fractionOf(
  anchor: Anchor,
  fraction: number,
): FractionAnchorExpression {
  return new FractionAnchorExpression(anchor, fraction);
}

export function hCenter(
  object: XAnchoredObject,
): HorizontalCenterAnchorExpression {
  return new HorizontalCenterAnchorExpression(
    object.leftAnchor,
    object.rightAnchor,
  );
}

export function vCenter(
  object: YAnchoredObject,
): VerticalCenterAnchorExpression {
  return new VerticalCenterAnchorExpression(
    object.topAnchor,
    object.bottomAnchor,
  );
}
