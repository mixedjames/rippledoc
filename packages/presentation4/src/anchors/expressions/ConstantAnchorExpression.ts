import type { AnchorExpression, Anchor } from "../Anchor";

export class ConstantAnchorExpression implements AnchorExpression {
  readonly dependencies: readonly Anchor[] = [];

  constructor(readonly value: number) {}

  evaluate(): number {
    return this.value;
  }
}
