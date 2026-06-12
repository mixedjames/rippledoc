/**
 * Tests for the anchor expression classes.
 *
 * These tests cover the four concrete expression types in isolation. All
 * expression tests use a minimal Anchor stub — ConcreteAnchor does not need
 * to exist for these to pass.
 */

import { describe, it, expect, vi } from "vitest";
import { ConstantAnchorExpression } from "../expressions/ConstantAnchorExpression";
import { OffsetAnchorExpression } from "../expressions/OffsetAnchorExpression";
import { FractionAnchorExpression } from "../expressions/FractionAnchorExpression";
import { DerivedAnchorExpression } from "../expressions/DerivedAnchorExpression";
import type { Anchor, AnchorExpression } from "../Anchor";

// Minimal Anchor stub — only value matters for expression evaluation.
function stubAnchor(value: number): Anchor {
  return {
    get value() {
      return value;
    },
    get expression(): AnchorExpression {
      return { evaluate: () => value, dependencies: [] };
    },
    get dependents(): readonly Anchor[] {
      return [];
    },
    get dependencies(): readonly Anchor[] {
      return [];
    },
  };
}

// Mutable variant for testing that expressions read live values.
function mutableStubAnchor(
  initial: number,
): Anchor & { setValue(n: number): void } {
  let current = initial;
  return {
    get value() {
      return current;
    },
    setValue(n: number) {
      current = n;
    },
    get expression(): AnchorExpression {
      return { evaluate: () => current, dependencies: [] };
    },
    get dependents(): readonly Anchor[] {
      return [];
    },
    get dependencies(): readonly Anchor[] {
      return [];
    },
  };
}

// ── ConstantAnchorExpression ──────────────────────────────────────────────────

describe("ConstantAnchorExpression", () => {
  describe("evaluate", () => {
    it("returns the value it was constructed with", () => {
      expect(new ConstantAnchorExpression(42).evaluate()).toBe(42);
    });

    it("returns zero", () => {
      expect(new ConstantAnchorExpression(0).evaluate()).toBe(0);
    });

    it("returns negative values", () => {
      expect(new ConstantAnchorExpression(-100).evaluate()).toBe(-100);
    });

    it("returns fractional values", () => {
      expect(new ConstantAnchorExpression(3.14).evaluate()).toBeCloseTo(3.14);
    });
  });

  describe("dependencies", () => {
    it("is an empty array", () => {
      expect(new ConstantAnchorExpression(10).dependencies).toHaveLength(0);
    });

    it("is the same array reference on repeated access", () => {
      const expr = new ConstantAnchorExpression(10);
      expect(expr.dependencies).toBe(expr.dependencies);
    });
  });

  describe("properties", () => {
    it("stores value", () => {
      expect(new ConstantAnchorExpression(7).value).toBe(7);
    });
  });
});

// ── OffsetAnchorExpression ────────────────────────────────────────────────────

describe("OffsetAnchorExpression", () => {
  describe("evaluate", () => {
    it("returns base + offset", () => {
      expect(new OffsetAnchorExpression(stubAnchor(100), 20).evaluate()).toBe(
        120,
      );
    });

    it("returns base + offset with negative offset", () => {
      expect(new OffsetAnchorExpression(stubAnchor(100), -30).evaluate()).toBe(
        70,
      );
    });

    it("returns base when offset is zero", () => {
      expect(new OffsetAnchorExpression(stubAnchor(55), 0).evaluate()).toBe(55);
    });

    it("handles negative base value", () => {
      expect(new OffsetAnchorExpression(stubAnchor(-10), 5).evaluate()).toBe(
        -5,
      );
    });

    it("reads base.value at call time, not construction time", () => {
      const base = mutableStubAnchor(10);
      const expr = new OffsetAnchorExpression(base, 5);
      expect(expr.evaluate()).toBe(15);
      base.setValue(20);
      expect(expr.evaluate()).toBe(25);
    });
  });

  describe("dependencies", () => {
    it("contains exactly one entry", () => {
      const base = stubAnchor(0);
      expect(new OffsetAnchorExpression(base, 0).dependencies).toHaveLength(1);
    });

    it("contains the base anchor by reference", () => {
      const base = stubAnchor(0);
      expect(new OffsetAnchorExpression(base, 0).dependencies[0]).toBe(base);
    });

    it("is the same array reference on repeated access", () => {
      const expr = new OffsetAnchorExpression(stubAnchor(0), 0);
      expect(expr.dependencies).toBe(expr.dependencies);
    });
  });

  describe("properties", () => {
    it("stores base", () => {
      const base = stubAnchor(0);
      expect(new OffsetAnchorExpression(base, 5).base).toBe(base);
    });

    it("stores offset", () => {
      expect(new OffsetAnchorExpression(stubAnchor(0), 99).offset).toBe(99);
    });
  });
});

// ── FractionAnchorExpression ──────────────────────────────────────────────────

describe("FractionAnchorExpression", () => {
  describe("evaluate", () => {
    it("returns base * fraction", () => {
      expect(
        new FractionAnchorExpression(stubAnchor(200), 0.5).evaluate(),
      ).toBe(100);
    });

    it("returns zero when fraction is zero", () => {
      expect(new FractionAnchorExpression(stubAnchor(999), 0).evaluate()).toBe(
        0,
      );
    });

    it("returns base when fraction is one", () => {
      expect(new FractionAnchorExpression(stubAnchor(42), 1).evaluate()).toBe(
        42,
      );
    });

    it("scales up when fraction > 1", () => {
      expect(new FractionAnchorExpression(stubAnchor(100), 2).evaluate()).toBe(
        200,
      );
    });

    it("returns negative result with negative fraction", () => {
      expect(new FractionAnchorExpression(stubAnchor(50), -1).evaluate()).toBe(
        -50,
      );
    });

    it("reads base.value at call time, not construction time", () => {
      const base = mutableStubAnchor(100);
      const expr = new FractionAnchorExpression(base, 0.5);
      expect(expr.evaluate()).toBe(50);
      base.setValue(400);
      expect(expr.evaluate()).toBe(200);
    });
  });

  describe("dependencies", () => {
    it("contains exactly one entry", () => {
      const base = stubAnchor(0);
      expect(new FractionAnchorExpression(base, 1).dependencies).toHaveLength(
        1,
      );
    });

    it("contains the base anchor by reference", () => {
      const base = stubAnchor(0);
      expect(new FractionAnchorExpression(base, 1).dependencies[0]).toBe(base);
    });

    it("is the same array reference on repeated access", () => {
      const expr = new FractionAnchorExpression(stubAnchor(0), 1);
      expect(expr.dependencies).toBe(expr.dependencies);
    });
  });

  describe("properties", () => {
    it("stores base", () => {
      const base = stubAnchor(0);
      expect(new FractionAnchorExpression(base, 0.5).base).toBe(base);
    });

    it("stores fraction", () => {
      expect(new FractionAnchorExpression(stubAnchor(0), 0.25).fraction).toBe(
        0.25,
      );
    });
  });
});

// ── DerivedAnchorExpression ───────────────────────────────────────────────────

describe("DerivedAnchorExpression", () => {
  describe("evaluate", () => {
    it("calls the evaluator and returns its value", () => {
      const expr = new DerivedAnchorExpression([], () => 123, "test");
      expect(expr.evaluate()).toBe(123);
    });

    it("calls the evaluator each time evaluate() is called", () => {
      const evaluator = vi.fn(() => 42);
      const expr = new DerivedAnchorExpression([], evaluator, "test");
      expr.evaluate();
      expr.evaluate();
      expect(evaluator).toHaveBeenCalledTimes(2);
    });

    it("reflects changes in closed-over mutable state", () => {
      let count = 0;
      const expr = new DerivedAnchorExpression([], () => ++count, "counter");
      expect(expr.evaluate()).toBe(1);
      expect(expr.evaluate()).toBe(2);
    });

    it("can read from multiple dependency anchors via closure", () => {
      const a = mutableStubAnchor(10);
      const b = mutableStubAnchor(5);
      const expr = new DerivedAnchorExpression(
        [a, b],
        () => a.value - b.value,
        "a-b",
      );
      expect(expr.evaluate()).toBe(5);
      a.setValue(20);
      expect(expr.evaluate()).toBe(15);
    });
  });

  describe("dependencies", () => {
    it("is empty when constructed with no deps", () => {
      expect(
        new DerivedAnchorExpression([], () => 0, "x").dependencies,
      ).toHaveLength(0);
    });

    it("contains the provided anchors in order", () => {
      const a = stubAnchor(1);
      const b = stubAnchor(2);
      const expr = new DerivedAnchorExpression([a, b], () => 0, "x");
      expect(expr.dependencies[0]).toBe(a);
      expect(expr.dependencies[1]).toBe(b);
    });

    it("is the same array reference on repeated access", () => {
      const expr = new DerivedAnchorExpression([], () => 0, "x");
      expect(expr.dependencies).toBe(expr.dependencies);
    });
  });

  describe("properties", () => {
    it("stores description", () => {
      const expr = new DerivedAnchorExpression([], () => 0, "my-description");
      expect(expr.description).toBe("my-description");
    });
  });
});
