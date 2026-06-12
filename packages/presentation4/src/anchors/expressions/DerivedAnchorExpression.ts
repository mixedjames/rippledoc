import type { AnchorExpression, Anchor } from "../Anchor";

/**
 * A custom expression with explicit dependencies and a closure-based evaluator.
 *
 * Used internally by ConcreteXYAnchors to derive the third axis value from two
 * constrained anchors, and by CorePresentation for the viewportHeight anchor.
 * The `description` field is for debugging and future GUI introspection.
 */
export class DerivedAnchorExpression implements AnchorExpression {
  constructor(
    readonly dependencies: readonly Anchor[],
    private readonly evaluator_: () => number,
    readonly description: string,
  ) {}

  evaluate(): number {
    return this.evaluator_();
  }
}
