import { Anchor } from "../Anchor";
import { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";
import { AnchorExpression } from "./AnchorExpression";

export class HorizontalCenterAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[];

  constructor(
    public readonly left: Anchor,
    public readonly right: Anchor,
  ) {
    this.dependencies = [left, right];
  }

  evaluate(): number {
    return (this.left.value + this.right.value) / 2;
  }

  visit(visitor: AnchorExpressionVisitor): void {
    visitor.visitHorizontalCenterExpression(this);
  }
}
