import type { Anchor, AnchorExpression } from "./Anchor";
import { ConstantAnchorExpression } from "./expressions/ConstantAnchorExpression";
import { GeometryConstraintError } from "./GeometryConstraintError";

/**
 * Concrete implementation of the Anchor interface.
 *
 * An anchor is a stable identity object that holds a value and knows how to
 * compute it from an expression. "Stable identity" is the key invariant: the
 * same ConcreteAnchor instance is always returned for a given geometry slot,
 * so callers can hold references and depend on them without the object being
 * swapped out under them.
 *
 * Mutation works by replacing the expression via applyExpressions — never by
 * creating a new anchor. This keeps external references valid across updates.
 *
 * The dependency graph is maintained symmetrically:
 *   - dependencies  — anchors this one reads from (owned by the expression)
 *   - dependents    — anchors that read from this one (maintained here)
 *
 * Both directions are always kept consistent by applyExpressions.
 */
export class ConcreteAnchor implements Anchor {
  private expression_: AnchorExpression;

  // Anchors that currently list this anchor in their expression's dependencies.
  // Kept as a Set to allow O(1) add/delete when the dependency graph changes.
  private readonly internalDependents_: Set<ConcreteAnchor> = new Set();

  constructor(
    initialExpression: AnchorExpression = new ConstantAnchorExpression(0),
  ) {
    this.expression_ = initialExpression;

    // Register this anchor as a dependent of every anchor it initially reads.
    // This mirrors what applyExpressions does in Phase 3, keeping the graph
    // consistent from the very first moment the anchor exists.
    for (const dep of initialExpression.dependencies) {
      (dep as ConcreteAnchor).internalDependents_.add(this);
    }
  }

  // ── Anchor interface ───────────────────────────────────────────────────────

  get value(): number {
    return this.expression_.evaluate();
  }

  get expression(): AnchorExpression {
    return this.expression_;
  }

  get dependencies(): readonly Anchor[] {
    return this.expression_.dependencies;
  }

  get dependents(): readonly Anchor[] {
    return [...this.internalDependents_];
  }

  // ── Cloning ────────────────────────────────────────────────────────────────

  /**
   * Returns a new ConcreteAnchor that starts with the same expression as this
   * one. The clone's internalDependents_ starts empty — nothing yet reads from
   * it. The dependency links from the expression (i.e. anchors this clone reads
   * from) are wired up via the constructor, so those anchors will know about
   * the clone immediately.
   *
   * Used by ConcreteXYAnchors when copying an anchor set to a new layout.
   */
  clone(): ConcreteAnchor {
    return new ConcreteAnchor(this.expression_);
  }

  // ── Graph mutation ─────────────────────────────────────────────────────────

  /**
   * Atomically replaces the expressions of one or more anchors and keeps the
   * dependency graph consistent.
   *
   * "Atomic" means: either all updates are applied and the graph is valid, or
   * none are applied and the graph is left exactly as it was. The cycle check
   * in Phase 1 is the gate — it inspects the proposed graph without touching
   * any state, so a rejected update has no side effects.
   *
   * ── Phase 1: Cycle detection (read-only) ──────────────────────────────────
   *
   * We validate the PROPOSED graph — the graph that would exist after all
   * updates land — before touching anything. This is why the check comes first.
   *
   * getDependencies(anchor) simulates the proposed graph: if `anchor` is in the
   * update map it returns the PROPOSED expression's deps; otherwise it returns
   * the current expression's deps. This correctly handles the case where two
   * anchors each take a new dependency on each other in a single call — neither
   * has been mutated yet, but we still see the full proposed cycle.
   *
   * The DFS uses a three-state visit map:
   *   absent / 0 — not yet visited
   *   1          — currently on the DFS stack (this node is an ancestor of the
   *                node currently being explored)
   *   2          — fully explored; no cycle reachable from here
   *
   * If we reach a node already in state 1 we have found a back edge, which
   * means there is a cycle. We can safely skip state-2 nodes because we already
   * proved their subtrees cycle-free.
   *
   * ── Phase 2: Unregister old dependents ────────────────────────────────────
   *
   * For each anchor being updated, remove it from its CURRENT dependencies'
   * internalDependents_ sets. This must happen before Phase 3 so we don't
   * leave stale back-links if an anchor changes which anchors it reads from.
   *
   * ── Phase 3: Apply expressions and register new dependents ────────────────
   *
   * Now that the proposed graph is proven acyclic and old links are cleared, we
   * commit the new expressions and wire up the new dependent links. Phases 2
   * and 3 are kept separate so that a multi-anchor update that reassigns
   * dependencies among the updated anchors themselves does not accidentally
   * delete links that Phase 3 is about to add.
   *
   * ── Type cast note ────────────────────────────────────────────────────────
   *
   * AnchorExpression.dependencies is typed as `readonly Anchor[]` at the
   * interface level. We cast entries to ConcreteAnchor to reach
   * internalDependents_. This is safe because every Anchor in presentation4 is
   * a ConcreteAnchor — there is no other implementation.
   */
  static applyExpressions(
    updates: ReadonlyMap<ConcreteAnchor, AnchorExpression>,
  ): void {
    if (updates.size === 0) return;

    // ── Phase 1: Cycle detection ─────────────────────────────────────────────

    const getDependencies = (anchor: ConcreteAnchor): readonly Anchor[] =>
      updates.get(anchor)?.dependencies ?? anchor.expression_.dependencies;

    const visitState = new Map<ConcreteAnchor, 1 | 2>();

    const dfs = (anchor: ConcreteAnchor): void => {
      const state = visitState.get(anchor);
      if (state === 1) {
        throw new GeometryConstraintError(
          "Circular anchor dependency detected. The proposed expressions would " +
            "create a cycle in the dependency graph.",
        );
      }
      if (state === 2) return; // subgraph already proven cycle-free

      visitState.set(anchor, 1);
      for (const dep of getDependencies(anchor)) {
        dfs(dep as ConcreteAnchor);
      }
      visitState.set(anchor, 2);
    };

    for (const anchor of updates.keys()) {
      dfs(anchor);
    }

    // ── Phase 2: Unregister old dependents ───────────────────────────────────

    for (const [anchor] of updates) {
      for (const dep of anchor.expression_.dependencies) {
        (dep as ConcreteAnchor).internalDependents_.delete(anchor);
      }
    }

    // ── Phase 3: Apply expressions and register new dependents ───────────────

    for (const [anchor, expression] of updates) {
      anchor.expression_ = expression;
      for (const dep of expression.dependencies) {
        (dep as ConcreteAnchor).internalDependents_.add(anchor);
      }
    }
  }
}
