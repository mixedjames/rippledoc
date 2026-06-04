import { AnchorExpression } from "./AnchorExpression";
import { Anchor } from "../Anchor";
import { AnchorExpressionVisitor } from "./AnchorExpressionVisitor";

/**
 *
 */
export class ConstantAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[] = [];

  constructor(
    public readonly value: number,
    public readonly editable: boolean = true,
  ) { }

  evaluate(): number {
    return this.value;
  }

  visit(visitor: AnchorExpressionVisitor): void {
    visitor.visitConstantExpression(this);
  }
}
