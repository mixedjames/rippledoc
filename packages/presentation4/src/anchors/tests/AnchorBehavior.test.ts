/**
 * End-to-end anchor behaviour tests.
 *
 * These tests work through the full clientAPI stack: CorePresentation →
 * Section → Element. They are the p4 port of the p3 AnchorBehavior tests.
 *
 * API translation from p3:
 *   createPresentation()            → new CorePresentation()
 *   presentation.addSection()       → presentation.root.addSection()
 *   section.addElement()            → section.addMarkdownElement()
 *   element.leftAnchor              → element.anchors.left
 *   section.topAnchor               → section.anchors.top
 *   element.height (value)          → element.anchors.height.value
 *   presentation.layout(w, h)       → presentation.notifyViewResized(w, h)
 *   immutableConstant(x)            → constant(x)  (no editable concept in p4 yet)
 */

import { describe, expect, it } from "vitest";
import { CorePresentation } from "../../core/CorePresentation";
import { GeometryConstraintError } from "../GeometryConstraintError";
import { constant, fractionOf, offsetFrom } from "../factories";

function createElementUnderTest() {
  const presentation = new CorePresentation();
  const section = presentation.root.addSection();
  const element = section.addMarkdownElement();
  return { presentation, section, element };
}

describe("anchor behaviour", () => {
  describe("axis constraints", () => {
    it("rejects under-specified axis updates", () => {
      const { element } = createElementUnderTest();
      expect(() =>
        element.setHorizontalAnchors({ left: constant(10) }),
      ).toThrow(GeometryConstraintError);
    });

    it("rejects over-specified axis updates", () => {
      const { element } = createElementUnderTest();
      expect(() =>
        element.setVerticalAnchors({
          top: constant(10),
          bottom: constant(20),
          height: constant(10),
        }),
      ).toThrow(GeometryConstraintError);
    });
  });

  describe("dependency graph", () => {
    it("rejects cyclical anchor dependencies", () => {
      const { element } = createElementUnderTest();
      expect(() =>
        element.setHorizontalAnchors({
          left: offsetFrom(element.anchors.right, 1),
          width: constant(10),
        }),
      ).toThrow(GeometryConstraintError);
    });
  });

  describe("anchor identity", () => {
    it("keeps anchor object identity stable across updates", () => {
      const { section, element } = createElementUnderTest();
      const topAnchorBefore = element.anchors.top;

      element.setVerticalAnchors({
        top: offsetFrom(section.anchors.top, 10),
        height: fractionOf(section.anchors.height, 0.5),
      });

      // The anchor object must be the same reference — only the expression changed.
      expect(element.anchors.top).toBe(topAnchorBefore);
    });
  });

  describe("viewport anchors", () => {
    it("uses viewportHeightAnchor as a dynamic basis-space anchor expression", () => {
      const presentation = new CorePresentation({
        basisWidth: 1000,
        basisHeight: 800,
      });
      const section = presentation.root.addSection();
      const element = section.addMarkdownElement();

      element.setVerticalAnchors({
        top: constant(0),
        height: offsetFrom(presentation.viewportHeightAnchor, 0),
      });

      // Before any resize, viewportHeight equals basisHeight (1:1 mapping).
      expect(element.anchors.height.value).toBe(800);

      // Physical viewport 600×1000, basis 1000×800.
      // scaleX = 600/1000 = 0.6, scaleY = 1000/800 = 1.25 → scale = 0.6
      // viewportHeight = 1000 / 0.6 ≈ 1666.67
      presentation.notifyViewResized(600, 1000);
      expect(element.anchors.height.value).toBeCloseTo(1666.6666666666667);
      expect(element.anchors.bottom.value).toBeCloseTo(1666.6666666666667);
    });
  });
});
