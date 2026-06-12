import type { AnchorExpression, Anchor } from "../Anchor";

export class OffsetAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[];

  constructor(
    readonly base: Anchor,
    readonly offset: number,
  ) {
    this.dependencies = [base];
  }

  evaluate(): number {
    return this.base.value + this.offset;
  }
}
