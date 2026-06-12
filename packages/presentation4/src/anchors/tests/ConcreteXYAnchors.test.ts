/**
 * Tests for ConcreteXYAnchors.
 *
 * ConcreteXYAnchors is a plain container — these tests verify structure and
 * default state only. Constraint logic (2-of-3 rule) is tested in
 * AnchoredObjectBase.test.ts where it lives.
 */

import { describe, it, expect } from "vitest";
import { ConcreteXYAnchors } from "../ConcreteXYAnchors";
import { ConcreteAnchor } from "../ConcreteAnchor";

describe("ConcreteXYAnchors", () => {
  describe("construction", () => {
    it("exposes all six anchors", () => {
      const bag = new ConcreteXYAnchors();
      expect(bag.left).toBeDefined();
      expect(bag.right).toBeDefined();
      expect(bag.width).toBeDefined();
      expect(bag.top).toBeDefined();
      expect(bag.bottom).toBeDefined();
      expect(bag.height).toBeDefined();
    });

    it("all six anchors are ConcreteAnchor instances", () => {
      const bag = new ConcreteXYAnchors();
      expect(bag.left).toBeInstanceOf(ConcreteAnchor);
      expect(bag.right).toBeInstanceOf(ConcreteAnchor);
      expect(bag.width).toBeInstanceOf(ConcreteAnchor);
      expect(bag.top).toBeInstanceOf(ConcreteAnchor);
      expect(bag.bottom).toBeInstanceOf(ConcreteAnchor);
      expect(bag.height).toBeInstanceOf(ConcreteAnchor);
    });

    it("all six anchors default to value 0", () => {
      const bag = new ConcreteXYAnchors();
      expect(bag.left.value).toBe(0);
      expect(bag.right.value).toBe(0);
      expect(bag.width.value).toBe(0);
      expect(bag.top.value).toBe(0);
      expect(bag.bottom.value).toBe(0);
      expect(bag.height.value).toBe(0);
    });

    it("all six anchors are distinct objects", () => {
      const bag = new ConcreteXYAnchors();
      const anchors = [
        bag.left,
        bag.right,
        bag.width,
        bag.top,
        bag.bottom,
        bag.height,
      ];
      const unique = new Set(anchors);
      expect(unique.size).toBe(6);
    });
  });

  describe("anchor identity", () => {
    it("returns the same object on every access", () => {
      const bag = new ConcreteXYAnchors();
      expect(bag.left).toBe(bag.left);
      expect(bag.top).toBe(bag.top);
      expect(bag.width).toBe(bag.width);
    });

    it("each bag instance owns its own anchors", () => {
      const a = new ConcreteXYAnchors();
      const b = new ConcreteXYAnchors();
      expect(a.left).not.toBe(b.left);
    });
  });
});
