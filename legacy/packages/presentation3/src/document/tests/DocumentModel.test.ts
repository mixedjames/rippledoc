import { describe, expect, it } from "vitest";
import {
  ConcretePresentation,
  createPresentation,
} from "../presentation/Presentation";
import { ConcreteBitmapImageElement } from "../element/ConcreteBitmapImageElement";
import { ConcreteMarkdownElement } from "../element/ConcreteMarkdownElement";
import { ConcreteSVGImageElement } from "../element/ConcreteSVGImageElement";

describe("presentation3 document model", () => {
  it("creates full-width, stacked sections by default", () => {
    const presentation = createPresentation({
      basisWidth: 1200,
      basisHeight: 800,
    });

    const first = presentation.addSection();
    const second = presentation.addSection();

    expect(first.top).toBe(0);
    expect(first.bottom).toBe(800);

    expect(second.top).toBe(800);
    expect(second.bottom).toBe(1600);
    expect(presentation.totalHeight).toBe(1600);
  });

  it("creates elements using fixed default percentages", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    const element = section.addElement();

    expect(element.left).toBe(50);
    expect(element.width).toBe(300);
    expect(element.right).toBe(350);

    expect(element.top).toBe(50);
    expect(element.height).toBe(200);
    expect(element.bottom).toBe(250);
  });

  it("creates explicit polymorphic element types", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    const bitmap = section.addBitmapImageElement();
    const svg = section.addSVGImageElement();
    const markdown = section.addMarkdownElement();

    expect(bitmap).toBeInstanceOf(ConcreteBitmapImageElement);
    expect(svg).toBeInstanceOf(ConcreteSVGImageElement);
    expect(markdown).toBeInstanceOf(ConcreteMarkdownElement);
  });

  it("keeps addElement backward-compatible by delegating to markdown", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    const element = section.addElement();

    expect(element).toBeInstanceOf(ConcreteMarkdownElement);
  });

  it("stores markdown content in the markdown element model", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    const markdownElement = section.addMarkdownElement("# Hello");
    expect(markdownElement.markdown).toBe("# Hello");

    markdownElement.setMarkdown("**Updated**");
    expect(markdownElement.markdown).toBe("**Updated**");
  });

  it("computes viewport height in basis coordinates", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    }) as ConcretePresentation;

    expect(presentation.viewportHeight).toBe(800);

    presentation.layout(600, 1000);

    expect(presentation.viewportHeight).toBeCloseTo(1666.6666666666667);
  });

  it("falls back to basis height when scale is zero", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    }) as ConcretePresentation;

    presentation.layout(0, 0);

    expect(presentation.viewportHeight).toBe(800);
  });

  it("exposes a stable viewportHeight anchor", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    }) as ConcretePresentation;

    const anchorBefore = presentation.viewportHeightAnchor;

    presentation.layout(600, 1000);

    expect(presentation.viewportHeightAnchor).toBe(anchorBefore);
    expect(presentation.viewportHeightAnchor.value).toBeCloseTo(
      presentation.viewportHeight,
    );
  });
});
