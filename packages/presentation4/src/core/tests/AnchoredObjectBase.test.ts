/**
 * Tests for AnchoredObjectBase.
 *
 * AnchoredObjectBase is abstract, so we use a minimal concrete subclass that
 * widens the protected helpers to public. All tests go through that subclass.
 */

import { describe, it, expect } from "vitest";
import { AnchoredObjectBase } from "../AnchoredObjectBase";
import { GeometryConstraintError } from "../../anchors/GeometryConstraintError";
import { constant, offsetFrom, fractionOf } from "../../anchors/factories";

class TestObject extends AnchoredObjectBase {
  setH(descriptor: Parameters<AnchoredObjectBase["setHorizontalAnchors_"]>[0]) {
    this.setHorizontalAnchors_(descriptor);
  }
  setV(descriptor: Parameters<AnchoredObjectBase["setVerticalAnchors_"]>[0]) {
    this.setVerticalAnchors_(descriptor);
  }
}

// ── anchors bag ───────────────────────────────────────────────────────────────

describe("AnchoredObjectBase — anchors bag", () => {
  it("anchors returns an XYAnchors bag", () => {
    const obj = new TestObject();
    expect(obj.anchors).toBeDefined();
    expect(obj.anchors.left).toBeDefined();
    expect(obj.anchors.top).toBeDefined();
  });

  it("all six anchors default to value 0", () => {
    const obj = new TestObject();
    const { left, right, width, top, bottom, height } = obj.anchors;
    [left, right, width, top, bottom, height].forEach((a) =>
      expect(a.value).toBe(0),
    );
  });
});

// ── setHorizontalAnchors_ — 2-of-3 combinations ───────────────────────────────

describe("setHorizontalAnchors_ — 2-of-3 combinations", () => {
  it("left + width → right is derived as left + width", () => {
    const obj = new TestObject();
    obj.setH({ left: constant(10), width: constant(100) });
    expect(obj.anchors.left.value).toBe(10);
    expect(obj.anchors.width.value).toBe(100);
    expect(obj.anchors.right.value).toBe(110);
  });

  it("left + right → width is derived as right - left", () => {
    const obj = new TestObject();
    obj.setH({ left: constant(20), right: constant(80) });
    expect(obj.anchors.width.value).toBe(60);
  });

  it("right + width → left is derived as right - width", () => {
    const obj = new TestObject();
    obj.setH({ right: constant(200), width: constant(50) });
    expect(obj.anchors.left.value).toBe(150);
  });
});

// ── setVerticalAnchors_ — 2-of-3 combinations ────────────────────────────────

describe("setVerticalAnchors_ — 2-of-3 combinations", () => {
  it("top + height → bottom is derived as top + height", () => {
    const obj = new TestObject();
    obj.setV({ top: constant(0), height: constant(300) });
    expect(obj.anchors.bottom.value).toBe(300);
  });

  it("top + bottom → height is derived as bottom - top", () => {
    const obj = new TestObject();
    obj.setV({ top: constant(50), bottom: constant(250) });
    expect(obj.anchors.height.value).toBe(200);
  });

  it("bottom + height → top is derived as bottom - height", () => {
    const obj = new TestObject();
    obj.setV({ bottom: constant(400), height: constant(100) });
    expect(obj.anchors.top.value).toBe(300);
  });
});

// ── Derived anchor stays live ─────────────────────────────────────────────────

describe("derived anchor stays live", () => {
  it("derived right updates when left changes via a subsequent setH call", () => {
    const obj = new TestObject();
    obj.setH({ left: constant(10), width: constant(100) });
    expect(obj.anchors.right.value).toBe(110);

    obj.setH({ left: constant(50), width: constant(100) });
    expect(obj.anchors.right.value).toBe(150);
  });

  it("derived bottom tracks a changing top anchor", () => {
    const base = new TestObject();
    base.setV({ top: constant(0), height: constant(500) });

    const obj = new TestObject();
    obj.setV({
      top: offsetFrom(base.anchors.bottom, 10),
      height: constant(200),
    });
    expect(obj.anchors.top.value).toBe(510);

    // Changing base's height updates base.bottom, which updates obj.top.
    base.setV({ top: constant(0), height: constant(600) });
    expect(obj.anchors.top.value).toBe(610);
  });
});

// ── Constraint violations ─────────────────────────────────────────────────────

describe("constraint violations", () => {
  it("throws when fewer than 2 horizontal constraints are given", () => {
    const obj = new TestObject();
    expect(() => obj.setH({ left: constant(0) })).toThrow(
      GeometryConstraintError,
    );
  });

  it("throws when all 3 horizontal constraints are given", () => {
    const obj = new TestObject();
    expect(() =>
      obj.setH({
        left: constant(0),
        right: constant(100),
        width: constant(100),
      }),
    ).toThrow(GeometryConstraintError);
  });

  it("throws when fewer than 2 vertical constraints are given", () => {
    const obj = new TestObject();
    expect(() => obj.setV({ top: constant(0) })).toThrow(
      GeometryConstraintError,
    );
  });

  it("throws when all 3 vertical constraints are given", () => {
    const obj = new TestObject();
    expect(() =>
      obj.setV({
        top: constant(0),
        bottom: constant(100),
        height: constant(100),
      }),
    ).toThrow(GeometryConstraintError);
  });

  it("throws when no constraints are given", () => {
    const obj = new TestObject();
    expect(() => obj.setH({})).toThrow(GeometryConstraintError);
  });
});

// ── Cycle detection through the bag ──────────────────────────────────────────

describe("cycle detection", () => {
  it("throws when left depends on right (which is being derived from left)", () => {
    const obj = new TestObject();
    expect(() =>
      obj.setH({ left: offsetFrom(obj.anchors.right, 1), width: constant(10) }),
    ).toThrow(GeometryConstraintError);
  });

  it("leaves anchor values unchanged after a rejected cyclic update", () => {
    const obj = new TestObject();
    obj.setH({ left: constant(5), width: constant(50) });

    expect(() =>
      obj.setH({ left: offsetFrom(obj.anchors.right, 1), width: constant(10) }),
    ).toThrow(GeometryConstraintError);

    expect(obj.anchors.left.value).toBe(5);
    expect(obj.anchors.width.value).toBe(50);
    expect(obj.anchors.right.value).toBe(55);
  });
});

// ── Anchor identity stability ─────────────────────────────────────────────────

describe("anchor identity stability", () => {
  it("the six anchor objects are stable across setH calls", () => {
    const obj = new TestObject();
    const { left, right, width } = obj.anchors;
    obj.setH({ left: constant(0), width: constant(100) });
    expect(obj.anchors.left).toBe(left);
    expect(obj.anchors.right).toBe(right);
    expect(obj.anchors.width).toBe(width);
  });

  it("the six anchor objects are stable across setV calls", () => {
    const obj = new TestObject();
    const { top, bottom, height } = obj.anchors;
    obj.setV({ top: constant(0), height: constant(100) });
    expect(obj.anchors.top).toBe(top);
    expect(obj.anchors.bottom).toBe(bottom);
    expect(obj.anchors.height).toBe(height);
  });

  it("fractionOf a sibling anchor works across the bag", () => {
    const obj = new TestObject();
    obj.setH({ left: constant(0), width: constant(200) });
    obj.setV({ top: constant(0), height: fractionOf(obj.anchors.width, 0.5) });
    expect(obj.anchors.height.value).toBe(100);
  });
});
