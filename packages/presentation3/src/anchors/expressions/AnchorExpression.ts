import type { Anchor } from "../Anchor";
import type { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";

/**
 *
 */
export interface AnchorExpression {
  evaluate(owner: Anchor): number;
  readonly dependencies: readonly Anchor[];
  visit(visitor: AnchorExpressionVisitor): void;
}
