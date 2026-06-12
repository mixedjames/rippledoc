/**
 * Tests for ConcreteAnchor and GeometryConstraintError.
 *
 * Covers the dependency graph mechanics (construction, cloning, applyExpressions)
 * and the cycle-detection / atomicity guarantees of applyExpressions.
 */

import { describe, it, expect } from "vitest";
import type { AnchorExpression } from "../Anchor";
import { ConcreteAnchor } from "../ConcreteAnchor";
import { GeometryConstraintError } from "../GeometryConstraintError";
import { ConstantAnchorExpression } from "../expressions/ConstantAnchorExpression";
import { OffsetAnchorExpression } from "../expressions/OffsetAnchorExpression";
import { FractionAnchorExpression } from "../expressions/FractionAnchorExpression";
import { DerivedAnchorExpression } from "../expressions/DerivedAnchorExpression";

// ── GeometryConstraintError ───────────────────────────────────────────────────

describe("GeometryConstraintError", () => {
  it("is an instance of Error", () => {
    expect(new GeometryConstraintError("x")).toBeInstanceOf(Error);
  });

  it("has name GeometryConstraintError", () => {
    expect(new GeometryConstraintError("x").name).toBe(
      "GeometryConstraintError",
    );
  });

  it("carries the provided message", () => {
    expect(new GeometryConstraintError("bad cycle").message).toBe("bad cycle");
  });
});

// ── Construction ──────────────────────────────────────────────────────────────

describe("ConcreteAnchor construction", () => {
  it("defaults to value 0", () => {
    expect(new ConcreteAnchor().value).toBe(0);
  });

  it("uses a provided initial expression", () => {
    const anchor = new ConcreteAnchor(new ConstantAnchorExpression(99));
    expect(anchor.value).toBe(99);
  });

  it("starts with no dependents", () => {
    expect(new ConcreteAnchor().dependents).toHaveLength(0);
  });

  it("starts with no dependencies when constructed with a constant", () => {
    expect(new ConcreteAnchor().dependencies).toHaveLength(0);
  });

  it("registers itself as a dependent of its initial expression's dependencies", () => {
    const base = new ConcreteAnchor(new ConstantAnchorExpression(10));
    const derived = new ConcreteAnchor(new OffsetAnchorExpression(base, 5));
    expect(base.dependents).toContain(derived);
  });
});

// ── value / expression / dependencies ─────────────────────────────────────────

describe("ConcreteAnchor interface properties", () => {
  it("value delegates to expression.evaluate()", () => {
    const anchor = new ConcreteAnchor(new ConstantAnchorExpression(42));
    expect(anchor.value).toBe(42);
  });

  it("expression returns the current expression object", () => {
    const expr = new ConstantAnchorExpression(7);
    const anchor = new ConcreteAnchor(expr);
    expect(anchor.expression).toBe(expr);
  });

  it("dependencies returns the same array as expression.dependencies", () => {
    const base = new ConcreteAnchor();
    const expr = new OffsetAnchorExpression(base, 1);
    const anchor = new ConcreteAnchor(expr);
    expect(anchor.dependencies).toBe(expr.dependencies);
  });
});

// ── Dependents ────────────────────────────────────────────────────────────────

describe("ConcreteAnchor dependents", () => {
  it("gains a dependent when another anchor is set to read from it", () => {
    const a = new ConcreteAnchor();
    const b = new ConcreteAnchor();
    ConcreteAnchor.applyExpressions(
      new Map([[b, new OffsetAnchorExpression(a, 1)]]),
    );
    expect(a.dependents).toContain(b);
  });

  it("loses a dependent when that anchor switches away from it", () => {
    const a = new ConcreteAnchor();
    const b = new ConcreteAnchor();
    const c = new ConcreteAnchor();
    ConcreteAnchor.applyExpressions(
      new Map([[b, new OffsetAnchorExpression(a, 1)]]),
    );
    ConcreteAnchor.applyExpressions(
      new Map([[b, new OffsetAnchorExpression(c, 1)]]),
    );
    expect(a.dependents).not.toContain(b);
    expect(c.dependents).toContain(b);
  });

  it("can have multiple dependents simultaneously", () => {
    const a = new ConcreteAnchor();
    const b = new ConcreteAnchor();
    const c = new ConcreteAnchor();
    ConcreteAnchor.applyExpressions(
      new Map<ConcreteAnchor, AnchorExpression>([
        [b, new OffsetAnchorExpression(a, 1)],
        [c, new FractionAnchorExpression(a, 0.5)],
      ]),
    );
    expect(a.dependents).toContain(b);
    expect(a.dependents).toContain(c);
  });
});

// ── Clone ──────────────────────────────────────────────────────────────────────

describe("ConcreteAnchor.clone", () => {
  it("returns a distinct object", () => {
    const a = new ConcreteAnchor();
    expect(a.clone()).not.toBe(a);
  });

  it("clone carries the same expression", () => {
    const expr = new ConstantAnchorExpression(55);
    const a = new ConcreteAnchor(expr);
    expect(a.clone().expression).toBe(expr);
  });

  it("clone has no dependents initially", () => {
    const a = new ConcreteAnchor(new ConstantAnchorExpression(1));
    const b = new ConcreteAnchor(new OffsetAnchorExpression(a, 0));
    // b depends on a; clone of a should have no dependents of its own
    expect(a.clone().dependents).toHaveLength(0);
  });

  it("updating the clone's expression does not affect the original", () => {
    const original = new ConcreteAnchor(new ConstantAnchorExpression(10));
    const clone = original.clone();
    ConcreteAnchor.applyExpressions(
      new Map([[clone, new ConstantAnchorExpression(99)]]),
    );
    expect(original.value).toBe(10);
    expect(clone.value).toBe(99);
  });
});

// ── applyExpressions — basic ──────────────────────────────────────────────────

describe("applyExpressions — basic", () => {
  it("empty map is a no-op", () => {
    const a = new ConcreteAnchor(new ConstantAnchorExpression(5));
    ConcreteAnchor.applyExpressions(new Map());
    expect(a.value).toBe(5);
  });

  it("replaces a constant expression", () => {
    const a = new ConcreteAnchor();
    ConcreteAnchor.applyExpressions(
      new Map([[a, new ConstantAnchorExpression(77)]]),
    );
    expect(a.value).toBe(77);
  });

  it("expression getter reflects the new expression after update", () => {
    const a = new ConcreteAnchor();
    const next = new ConstantAnchorExpression(3);
    ConcreteAnchor.applyExpressions(new Map([[a, next]]));
    expect(a.expression).toBe(next);
  });

  it("can update multiple anchors in a single call", () => {
    const a = new ConcreteAnchor();
    const b = new ConcreteAnchor();
    ConcreteAnchor.applyExpressions(
      new Map<ConcreteAnchor, AnchorExpression>([
        [a, new ConstantAnchorExpression(1)],
        [b, new ConstantAnchorExpression(2)],
      ]),
    );
    expect(a.value).toBe(1);
    expect(b.value).toBe(2);
  });

  it("a derived expression evaluates through its dependencies", () => {
    const a = new ConcreteAnchor(new ConstantAnchorExpression(100));
    const b = new ConcreteAnchor();
    ConcreteAnchor.applyExpressions(
      new Map([[b, new OffsetAnchorExpression(a, 50)]]),
    );
    expect(b.value).toBe(150);
  });
});

// ── applyExpressions — cycle detection ────────────────────────────────────────

describe("applyExpressions — cycle detection", () => {
  it("throws GeometryConstraintError for a self-referential anchor", () => {
    const a = new ConcreteAnchor();
    expect(() =>
      ConcreteAnchor.applyExpressions(
        new Map([[a, new OffsetAnchorExpression(a, 1)]]),
      ),
    ).toThrow(GeometryConstraintError);
  });

  it("throws for a direct two-anchor cycle (A→B, B→A) in a single call", () => {
    const a = new ConcreteAnchor();
    const b = new ConcreteAnchor();
    expect(() =>
      ConcreteAnchor.applyExpressions(
        new Map([
          [a, new OffsetAnchorExpression(b, 1)],
          [b, new OffsetAnchorExpression(a, 1)],
        ]),
      ),
    ).toThrow(GeometryConstraintError);
  });

  it("throws for an indirect three-node cycle (A→B→C→A)", () => {
    const a = new ConcreteAnchor();
    const b = new ConcreteAnchor();
    const c = new ConcreteAnchor();
    // First wire B→C and C→A as existing state.
    ConcreteAnchor.applyExpressions(
      new Map([
        [b, new OffsetAnchorExpression(c, 0)],
        [c, new OffsetAnchorExpression(a, 0)],
      ]),
    );
    // Now trying to set A→B completes the cycle.
    expect(() =>
      ConcreteAnchor.applyExpressions(
        new Map([[a, new OffsetAnchorExpression(b, 0)]]),
      ),
    ).toThrow(GeometryConstraintError);
  });

  it("does not throw for a valid DAG", () => {
    const a = new ConcreteAnchor(new ConstantAnchorExpression(10));
    const b = new ConcreteAnchor();
    const c = new ConcreteAnchor();
    expect(() =>
      ConcreteAnchor.applyExpressions(
        new Map([
          [b, new OffsetAnchorExpression(a, 1)],
          [c, new OffsetAnchorExpression(b, 1)],
        ]),
      ),
    ).not.toThrow();
    expect(c.value).toBe(12);
  });

  it("does not throw when a diamond dependency is present (a shared ancestor is not a cycle)", () => {
    // a ← b ← d
    //   ↖ c ↗
    const a = new ConcreteAnchor(new ConstantAnchorExpression(10));
    const b = new ConcreteAnchor();
    const c = new ConcreteAnchor();
    const d = new ConcreteAnchor();
    expect(() =>
      ConcreteAnchor.applyExpressions(
        new Map<ConcreteAnchor, AnchorExpression>([
          [b, new OffsetAnchorExpression(a, 1)],
          [c, new OffsetAnchorExpression(a, 2)],
          [
            d,
            new DerivedAnchorExpression([b, c], () => b.value + c.value, "b+c"),
          ],
        ]),
      ),
    ).not.toThrow();
    expect(d.value).toBe(23); // (10+1) + (10+2)
  });
});

// ── applyExpressions — atomicity ──────────────────────────────────────────────

describe("applyExpressions — atomicity", () => {
  it("leaves expressions unchanged after a rejected self-cycle", () => {
    const a = new ConcreteAnchor(new ConstantAnchorExpression(42));
    try {
      ConcreteAnchor.applyExpressions(
        new Map([[a, new OffsetAnchorExpression(a, 1)]]),
      );
    } catch {
      // expected
    }
    expect(a.value).toBe(42);
  });

  it("leaves expressions unchanged after a rejected two-anchor cycle", () => {
    const a = new ConcreteAnchor(new ConstantAnchorExpression(1));
    const b = new ConcreteAnchor(new ConstantAnchorExpression(2));
    try {
      ConcreteAnchor.applyExpressions(
        new Map([
          [a, new OffsetAnchorExpression(b, 0)],
          [b, new OffsetAnchorExpression(a, 0)],
        ]),
      );
    } catch {
      // expected
    }
    expect(a.value).toBe(1);
    expect(b.value).toBe(2);
  });

  it("leaves dependent links unchanged after a rejected cycle", () => {
    const a = new ConcreteAnchor(new ConstantAnchorExpression(10));
    const b = new ConcreteAnchor();
    // Establish a valid link: b depends on a.
    ConcreteAnchor.applyExpressions(
      new Map([[b, new OffsetAnchorExpression(a, 5)]]),
    );
    // Attempt a cycle: a tries to depend on b.
    try {
      ConcreteAnchor.applyExpressions(
        new Map([[a, new OffsetAnchorExpression(b, 1)]]),
      );
    } catch {
      // expected
    }
    // The original links must be intact.
    expect(a.dependents).toContain(b);
    expect(a.dependencies).toHaveLength(0);
    expect(b.value).toBe(15);
  });
});
