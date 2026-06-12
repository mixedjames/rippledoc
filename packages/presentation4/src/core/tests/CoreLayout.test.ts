/**
 * Tests for CoreLayout and CoreLayoutManager.
 *
 * CoreLayout is an immutable value object. CoreLayoutManager owns the ordered
 * list of layouts and tracks which one is active.
 */

import { describe, it, expect } from "vitest";
import { CoreLayout } from "../CoreLayout";
import { CoreLayoutManager } from "../CoreLayoutManager";
import type { Layout } from "../../clientAPI/Layout";
import type { LayoutPicker } from "../../clientAPI/LayoutPicker";

// ── CoreLayout ───────────────────────────────────────────────────────────────

describe("CoreLayout", () => {
  it("stores and returns basisWidth and basisHeight", () => {
    const layout = new CoreLayout({ basisWidth: 1920, basisHeight: 1080 });
    expect(layout.basisWidth).toBe(1920);
    expect(layout.basisHeight).toBe(1080);
  });
});

// ── CoreLayoutManager ────────────────────────────────────────────────────────

describe("CoreLayoutManager", () => {
  describe("construction", () => {
    it("creates exactly one default layout with the given dimensions", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      expect(mgr.layouts).toHaveLength(1);
      expect(mgr.defaultLayout.basisWidth).toBe(1000);
      expect(mgr.defaultLayout.basisHeight).toBe(800);
    });

    it("activeLayout starts as the default layout", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      expect(mgr.activeLayout).toBe(mgr.defaultLayout);
    });
  });

  describe("addLayout", () => {
    it("appends to the layouts list and returns the new layout", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      const second = mgr.addLayout({ basisWidth: 1920, basisHeight: 1080 });
      expect(mgr.layouts).toHaveLength(2);
      expect(mgr.layouts[1]).toBe(second);
      expect(second.basisWidth).toBe(1920);
      expect(second.basisHeight).toBe(1080);
    });

    it("defaultLayout always refers to the first layout, regardless of additions", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      const first = mgr.defaultLayout;
      mgr.addLayout({ basisWidth: 1920, basisHeight: 1080 });
      expect(mgr.defaultLayout).toBe(first);
    });
  });

  describe("setActiveLayout", () => {
    it("switches the active layout to a layout owned by this manager", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      const second = mgr.addLayout({ basisWidth: 1920, basisHeight: 1080 });
      mgr.setActiveLayout(second);
      expect(mgr.activeLayout).toBe(second);
    });

    it("throws when given a layout that does not belong to this manager", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      const other = new CoreLayoutManager({
        basisWidth: 1920,
        basisHeight: 1080,
      });
      const foreignLayout = other.defaultLayout;
      expect(() => mgr.setActiveLayout(foreignLayout)).toThrow();
    });

    it("can switch back to the default layout after changing", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      const second = mgr.addLayout({ basisWidth: 1920, basisHeight: 1080 });
      mgr.setActiveLayout(second);
      mgr.setActiveLayout(mgr.defaultLayout);
      expect(mgr.activeLayout).toBe(mgr.defaultLayout);
    });
  });

  describe("LayoutPicker", () => {
    it("hasLayoutPicker is false before a picker is set", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      expect(mgr.hasLayoutPicker).toBe(false);
    });

    it("layoutPicker throws when no picker has been set", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });
      expect(() => mgr.layoutPicker).toThrow();
    });

    it("setLayoutPicker enables hasLayoutPicker and makes layoutPicker return the picker", () => {
      const mgr = new CoreLayoutManager({ basisWidth: 1000, basisHeight: 800 });

      // A picker that always selects the layout whose dimensions best fit the viewport.
      const picker: LayoutPicker = {
        pickLayout(w, h, layouts) {
          return (
            layouts.find(
              (l: Layout) => l.basisWidth <= w && l.basisHeight <= h,
            ) ?? layouts[0]!
          );
        },
      };

      mgr.setLayoutPicker(picker);

      expect(mgr.hasLayoutPicker).toBe(true);
      expect(mgr.layoutPicker).toBe(picker);
    });
  });
});
