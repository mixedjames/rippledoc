import { Anchor } from "../Anchor";
import { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";
import { AnchorExpression } from "./AnchorExpression";

/**
 *
 */
export class DerivedAnchorExpression implements AnchorExpression {
  constructor(
    readonly dependencies: readonly Anchor[],
    private readonly evaluator_: () => number,
    public readonly description: string,
  ) { }

  evaluate(): number {
    return this.evaluator_();
  }

  visit(visitor: AnchorExpressionVisitor): void {
    visitor.visitDerivedExpression(this);
  }
}
