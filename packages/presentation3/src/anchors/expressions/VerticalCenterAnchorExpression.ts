import { Anchor } from "../Anchor";
import { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";
import { AnchorExpression } from "./AnchorExpression";

export class VerticalCenterAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[];

  constructor(
    public readonly top: Anchor,
    public readonly bottom: Anchor,
  ) {
    this.dependencies = [top, bottom];
  }

  evaluate(): number {
    return (this.top.value + this.bottom.value) / 2;
  }

  visit(visitor: AnchorExpressionVisitor): void {
    visitor.visitVerticalCenterExpression(this);
  }
}
