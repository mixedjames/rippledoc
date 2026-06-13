/**
 * Tests for the presentation document model: CorePresentation, CorePresentationRoot,
 * CoreSection, and the three element types.
 *
 * These tests treat the model as a client would — they program against the clientAPI
 * interfaces and only import concrete classes to construct the root object.
 */

import { describe, it, expect } from "vitest";
import { CorePresentation } from "../CorePresentation";
import { constant } from "../../anchors/factories";

// ── CorePresentation ─────────────────────────────────────────────────────────

describe("CorePresentation", () => {
  describe("construction", () => {
    it("uses 1000×1000 basis dimensions when no options are given", () => {
      const p = new CorePresentation();
      expect(p.root.basisWidth).toBe(1000);
      expect(p.root.basisHeight).toBe(1000);
    });

    it("uses custom basis dimensions from options", () => {
      const p = new CorePresentation({ basisWidth: 1920, basisHeight: 1080 });
      expect(p.root.basisWidth).toBe(1920);
      expect(p.root.basisHeight).toBe(1080);
    });

    it("exposes a LayoutManager via .layout", () => {
      const p = new CorePresentation();
      expect(p.layout).toBeDefined();
      expect(p.layout.layouts).toHaveLength(1);
    });

    it("exposes a PresentationRoot via .root", () => {
      const p = new CorePresentation();
      expect(p.root).toBeDefined();
    });
  });

  describe("basisWidth and basisHeight reflect the active layout", () => {
    it("root.basisWidth and basisHeight update when the active layout changes", () => {
      const p = new CorePresentation({ basisWidth: 1000, basisHeight: 800 });
      const wide = p.layout.addLayout({ basisWidth: 1920, basisHeight: 1080 });

      expect(p.root.basisWidth).toBe(1000);
      expect(p.root.basisHeight).toBe(800);

      p.layout.setActiveLayout(wide);

      expect(p.root.basisWidth).toBe(1920);
      expect(p.root.basisHeight).toBe(1080);
    });
  });
});

// ── CorePresentationRoot ─────────────────────────────────────────────────────

describe("CorePresentationRoot", () => {
  describe("addSection / getSections", () => {
    it("addSection creates a new section and returns it", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      expect(section).toBeDefined();
    });

    it("getSections returns all added sections in insertion order", () => {
      const p = new CorePresentation();
      const first = p.root.addSection();
      const second = p.root.addSection();
      const third = p.root.addSection();

      const sections = p.root.getSections();
      expect(sections).toHaveLength(3);
      expect(sections[0]).toBe(first);
      expect(sections[1]).toBe(second);
      expect(sections[2]).toBe(third);
    });

    it("getSections returns an empty list when no sections have been added", () => {
      const p = new CorePresentation();
      expect(p.root.getSections()).toHaveLength(0);
    });
  });

  describe("removeSection", () => {
    it("removes the section from getSections", () => {
      const p = new CorePresentation();
      const s1 = p.root.addSection();
      const s2 = p.root.addSection();
      p.root.removeSection(s1);
      const sections = p.root.getSections();
      expect(sections).toHaveLength(1);
      expect(sections[0]).toBe(s2);
    });

    it("throws when the section does not belong to this root", () => {
      const p1 = new CorePresentation();
      const p2 = new CorePresentation();
      const foreign = p2.root.addSection();
      expect(() => p1.root.removeSection(foreign)).toThrow();
    });

    it("totalHeight reflects the removal", () => {
      const p = new CorePresentation();
      const s1 = p.root.addSection();
      const s2 = p.root.addSection();
      s1.setVerticalAnchors({ top: constant(0), height: constant(300) });
      s2.setVerticalAnchors({ top: constant(300), height: constant(200) });
      p.root.removeSection(s2);
      expect(p.root.totalHeight).toBe(300);
    });
  });

  describe("totalHeight", () => {
    it("is 0 with no sections", () => {
      expect(new CorePresentation().root.totalHeight).toBe(0);
    });

    it("is 0 when sections have no vertical anchors set", () => {
      // Sections default to zero geometry (all six anchors start at 0).
      const p = new CorePresentation();
      p.root.addSection();
      expect(p.root.totalHeight).toBe(0);
    });

    it("equals the bottom of a single section", () => {
      const p = new CorePresentation();
      const s = p.root.addSection();
      s.setVerticalAnchors({ top: constant(0), height: constant(500) });
      expect(p.root.totalHeight).toBe(500);
    });

    it("equals the bottom of the last section with multiple sections", () => {
      const p = new CorePresentation();
      const s1 = p.root.addSection();
      const s2 = p.root.addSection();
      s1.setVerticalAnchors({ top: constant(0), height: constant(300) });
      s2.setVerticalAnchors({ top: constant(300), height: constant(200) });
      expect(p.root.totalHeight).toBe(500);
    });

    it("updates live when a section's height anchor changes", () => {
      const p = new CorePresentation();
      const s = p.root.addSection();
      s.setVerticalAnchors({ top: constant(0), height: constant(400) });
      expect(p.root.totalHeight).toBe(400);
      s.setVerticalAnchors({ top: constant(0), height: constant(800) });
      expect(p.root.totalHeight).toBe(800);
    });
  });
});

// ── CoreSection ──────────────────────────────────────────────────────────────

describe("CoreSection", () => {
  describe("back-reference to root", () => {
    it("section.root is the same PresentationRoot that the section was added to", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      expect(section.root).toBe(p.root);
    });
  });

  describe("addMarkdownElement", () => {
    it("creates a MarkdownElement with empty markdown by default", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      expect(el.markdown).toBe("");
    });

    it("creates a MarkdownElement with the given initial markdown", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement("# Hello");
      expect(el.markdown).toBe("# Hello");
    });

    it("setMarkdown updates the markdown content", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement("initial");
      el.setMarkdown("updated");
      expect(el.markdown).toBe("updated");
    });
  });

  describe("addBitmapImageElement", () => {
    it("creates a BitmapImageElement with empty src and alt by default", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addBitmapImageElement();
      expect(el.src).toBe("");
      expect(el.alt).toBe("");
    });

    it("setSrc and setAlt update the values", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addBitmapImageElement();
      el.setSrc("image.png");
      el.setAlt("A descriptive label");
      expect(el.src).toBe("image.png");
      expect(el.alt).toBe("A descriptive label");
    });
  });

  describe("addSVGImageElement", () => {
    it("creates an SVGImageElement with empty src by default", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addSVGImageElement();
      expect(el.src).toBe("");
    });

    it("setSrc updates the src", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addSVGImageElement();
      el.setSrc("diagram.svg");
      expect(el.src).toBe("diagram.svg");
    });
  });

  describe("getElements", () => {
    it("returns all elements in insertion order", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const md = section.addMarkdownElement();
      const bmp = section.addBitmapImageElement();
      const svg = section.addSVGImageElement();

      const elements = section.getElements();
      expect(elements).toHaveLength(3);
      expect(elements[0]).toBe(md);
      expect(elements[1]).toBe(bmp);
      expect(elements[2]).toBe(svg);
    });

    it("returns an empty list when no elements have been added", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      expect(section.getElements()).toHaveLength(0);
    });
  });

  describe("removeElement", () => {
    it("removes the element from getElements", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el1 = section.addMarkdownElement("one");
      const el2 = section.addMarkdownElement("two");
      section.removeElement(el1);
      const elements = section.getElements();
      expect(elements).toHaveLength(1);
      expect(elements[0]).toBe(el2);
    });

    it("throws when the element does not belong to this section", () => {
      const p = new CorePresentation();
      const s1 = p.root.addSection();
      const s2 = p.root.addSection();
      const foreign = s2.addMarkdownElement();
      expect(() => s1.removeElement(foreign)).toThrow();
    });
  });

  describe("element.section back-reference", () => {
    it("element.section refers back to the section it was added to", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement("test");
      expect(el.section).toBe(section);
    });
  });
});
