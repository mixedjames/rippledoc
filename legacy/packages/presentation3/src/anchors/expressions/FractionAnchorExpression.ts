import { Anchor } from "../Anchor";
import { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";
import { AnchorExpression } from "./AnchorExpression";

export class FractionAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[];

  constructor(
    public readonly base: Anchor,
    public readonly fraction: number,
  ) {
    this.dependencies = [base];
  }

  evaluate(): number {
    return this.base.value * this.fraction;
  }

  visit(visitor: AnchorExpressionVisitor): void {
    visitor.visitFractionExpression(this);
  }
}
