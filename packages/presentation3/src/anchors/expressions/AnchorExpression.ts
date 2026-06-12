import type { Anchor } from "../Anchor";
import type { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";

/**
 * AnchorExpressions are immutable - Anchors are updated by replacing their expressions.
 * This allows Anchors to shared expressions.
 */
export interface AnchorExpression {
  evaluate(owner: Anchor): number;
  readonly dependencies: readonly Anchor[];
  visit(visitor: AnchorExpressionVisitor): void;
}
