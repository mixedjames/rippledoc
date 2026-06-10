import { describe, expect, it } from "vitest";
import {
  ConcretePresentation,
  createPresentation,
} from "../../document/presentation/Presentation";
import { GeometryConstraintError } from "../GeometryConstraintError";
import {
  constant,
  fractionOf,
  immutableConstant,
  offsetFrom,
} from "../factories";

function createElementUnderTest() {
  const section = createPresentation().addSection();
  const element = section.addElement();
  return { section, element };
}

describe("anchor behavior", () => {
  describe("axis constraints", () => {
    it("rejects under-specified axis updates", () => {
      const { element } = createElementUnderTest();

      expect(() =>
        element.setHorizontalAnchors({
          left: immutableConstant(10),
        }),
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
          left: offsetFrom(element.rightAnchor, 1),
          width: constant(10),
        }),
      ).toThrow(GeometryConstraintError);
    });
  });

  describe("anchor identity", () => {
    it("keeps anchor object identity stable across updates", () => {
      const { section, element } = createElementUnderTest();

      const leftAnchorBefore = element.leftAnchor;

      element.setHorizontalAnchors({
        left: offsetFrom(section.leftAnchor, 10),
        width: fractionOf(section.widthAnchor, 0.5),
      });

      expect(element.leftAnchor).toBe(leftAnchorBefore);
    });
  });

  describe("viewport anchors", () => {
    it("uses viewportHeight as a dynamic basis-space anchor expression", () => {
      const presentation = createPresentation({
        basisWidth: 1000,
        basisHeight: 800,
      }) as ConcretePresentation;
      const section = presentation.addSection();
      const element = section.addElement();

      element.setVerticalAnchors({
        top: constant(0),
        height: offsetFrom(presentation.viewportHeightAnchor, 0),
      });

      expect(element.height).toBe(800);

      presentation.layout(600, 1000);

      expect(element.height).toBeCloseTo(1666.6666666666667);
      expect(element.bottom).toBeCloseTo(1666.6666666666667);
    });
  });
});
