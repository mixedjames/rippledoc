import type { AnchorExpression, Anchor } from "../Anchor";

export class FractionAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[];

  constructor(
    readonly base: Anchor,
    readonly fraction: number,
  ) {
    this.dependencies = [base];
  }

  evaluate(): number {
    return this.base.value * this.fraction;
  }
}
