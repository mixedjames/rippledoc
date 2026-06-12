import type { AnchorOwner } from "./AnchorOwner";
import {
  AnchorExpression,
  ConstantAnchorExpression,
} from "./expressions/index";
import { GeometryConstraintError } from "./GeometryConstraintError";

export class Anchor {
  private readonly owner_: AnchorOwner;

  private expression_: AnchorExpression;

  private readonly internalDependents_ = new Set<Anchor>();

  constructor(
    owner: AnchorOwner,
    initialExpression: AnchorExpression = new ConstantAnchorExpression(
      0,
      false,
    ),
  ) {
    this.owner_ = owner;
    this.expression_ = initialExpression;

    for (const dependency of this.expression_.dependencies) {
      dependency.internalDependents_.add(this);
    }
  }

  // **********************************************************************************************
  // Public API
  // **********************************************************************************************

  get owner(): AnchorOwner {
    return this.owner_;
  }

  get value(): number {
    return this.expression_.evaluate(this);
  }

  get dependencies(): readonly Anchor[] {
    return this.expression_.dependencies;
  }

  get dependents(): readonly Anchor[] {
    return [...this.internalDependents_];
  }

  get currentExpression(): AnchorExpression {
    return this.expression_;
  }

  clone(): Anchor {
    return new Anchor(this.owner_, this.expression_);
  }

  setExpression(nextExpression: AnchorExpression): void {
    Anchor.applyExpressions(new Map([[this, nextExpression]]));
  }

  // **********************************************************************************************
  // Internal API
  //
  // Imports:
  //  - Should all be private
  // **********************************************************************************************

  static applyExpressions(
    updates: ReadonlyMap<Anchor, AnchorExpression>,
  ): void {
    if (updates.size === 0) {
      return;
    }

    const getDependencies = (anchor: Anchor): readonly Anchor[] =>
      updates.get(anchor)?.dependencies ?? anchor.dependencies;

    const visitState = new Map<Anchor, 0 | 1 | 2>();

    const dfs = (anchor: Anchor): void => {
      const state = visitState.get(anchor) ?? 0;
      if (state === 1) {
        throw new GeometryConstraintError(
          `Anchor cycle detected while updating an anchor.`,
        );
      }
      if (state === 2) {
        return;
      }

      visitState.set(anchor, 1);
      for (const dependency of getDependencies(anchor)) {
        dfs(dependency);
      }
      visitState.set(anchor, 2);
    };

    for (const anchor of updates.keys()) {
      dfs(anchor);
    }

    for (const [anchor] of updates) {
      for (const dependency of anchor.expression_.dependencies) {
        dependency.internalDependents_.delete(anchor);
      }
    }

    for (const [anchor, expression] of updates) {
      anchor.expression_ = expression;
    }

    for (const [anchor, expression] of updates) {
      for (const dependency of expression.dependencies) {
        dependency.internalDependents_.add(anchor);
      }
    }
  }
}
