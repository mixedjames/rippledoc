import type { ConstantAnchorExpression } from "./ConstantAnchorExpression";
import type { OffsetAnchorExpression } from "./OffsetAnchorExpression";
import type { FractionAnchorExpression } from "./FractionAnchorExpression";
import type { HorizontalCenterAnchorExpression } from "./HorizontalCenterAnchorExpression";
import type { VerticalCenterAnchorExpression } from "./VerticalCenterAnchorExpression";
import type { DerivedAnchorExpression } from "./DerivedAnchorExpression";

/**
 * Visitor interface for different types of anchor expressions.
 */
export interface AnchorExpressionVisitor {
  visitConstantExpression(expression: ConstantAnchorExpression): void;
  visitOffsetExpression(expression: OffsetAnchorExpression): void;
  visitFractionExpression(expression: FractionAnchorExpression): void;
  visitHorizontalCenterExpression(
    expression: HorizontalCenterAnchorExpression,
  ): void;
  visitVerticalCenterExpression(
    expression: VerticalCenterAnchorExpression,
  ): void;
  visitDerivedExpression(expression: DerivedAnchorExpression): void;
}
