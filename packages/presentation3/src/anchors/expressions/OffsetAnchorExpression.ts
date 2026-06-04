import { Anchor } from "../Anchor";
import { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";
import { AnchorExpression } from "./AnchorExpression";

/**
 *
 */
export class OffsetAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[];

  constructor(
    public readonly base: Anchor,
    public readonly offset: number,
  ) {
    this.dependencies = [base];
  }

  evaluate(): number {
    return this.base.value + this.offset;
  }

  visit(visitor: AnchorExpressionVisitor): void {
    visitor.visitOffsetExpression(this);
  }
}
