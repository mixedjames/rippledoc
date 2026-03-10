import { describe, it, expect } from "vitest";
import { Expression } from "@rippledoc/expressions";

import { Presentation } from "../model/Presentation";
import { PresentationGeometry } from "../model/PresentationGeometry";
import { Section } from "../model/Section";
import { Element, ContentDependentDimension } from "../model/Element";
import { ImageElement } from "../model/ImageElement";
import { HTMLFragmentElement } from "../model/HTMLElement";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { ElementTransform } from "../animation/ElementTransform";
import { SectionTransform } from "../animation/SectionTransform";
import { nullViewFactory } from "../view/NullViewFactory";

function makeConstExpression(value: number): Expression {
  // A tiny helper to create an Expression that always
  // evaluates to a constant value.
  // We reuse the Expression type but bypass the parser
  // for simplicity in these unit tests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Expression({
    evaluate: () => value,
  } as any);
}

describe("Presentation", () => {
  it("exposes slide dimensions from geometry", () => {
    const geometry = new PresentationGeometry({
      basisWidth: 800,
      basisHeight: 600,
    });

    const presentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry,
    });

    expect(presentation.slideWidth).toBe(800);
    expect(presentation.slideHeight).toBe(600);
  });

  it("returns sections array and view instance", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry: dummyGeometry,
    });

    const section = new Section({
      name: "Test Section",
      parent: dummyPresentation,
      sectionTop: makeConstExpression(0),
      sectionHeight: makeConstExpression(100),
      sectionBottom: makeConstExpression(100),
      elements: [],
      viewFactory: nullViewFactory,
    });

    const geometry = new PresentationGeometry({
      basisWidth: 1024,
      basisHeight: 768,
    });

    const presentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry,
    });

    presentation._setSections([section]);

    expect(presentation.sections).toHaveLength(1);
    expect(presentation.sections[0]).toBe(section);
    expect(presentation.view).toBeDefined();
  });

  it("delegates display.realise and display.layout to sections and views", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry: dummyGeometry,
    });

    const section = new Section({
      name: "Section for realise/layout",
      parent: dummyPresentation,
      sectionTop: makeConstExpression(0),
      sectionHeight: makeConstExpression(100),
      sectionBottom: makeConstExpression(100),
      elements: [],
      viewFactory: nullViewFactory,
    });

    const element = new Element({
      name: "test-element",
      parent: section,
      left: makeConstExpression(10),
      right: makeConstExpression(110),
      width: makeConstExpression(100),
      top: makeConstExpression(20),
      bottom: makeConstExpression(70),
      height: makeConstExpression(50),
      contentDependentDimension: ContentDependentDimension.None,
      viewFactory: nullViewFactory,
    });
    section._setElements([element]);
    const geometry = new PresentationGeometry({
      basisWidth: 640,
      basisHeight: 480,
    });

    const presentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry,
    });

    presentation._setSections([section]);

    // Should not throw and should traverse the tree.
    presentation.display.realise();
    presentation.display.layout();
  });

  it("supports ImageElement instances within sections", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry: dummyGeometry,
    });

    const section = new Section({
      name: "Section with image element",
      parent: dummyPresentation,
      sectionTop: makeConstExpression(0),
      sectionHeight: makeConstExpression(100),
      sectionBottom: makeConstExpression(100),
      elements: [],
      viewFactory: nullViewFactory,
    });

    const image = new ImageElement({
      source: "images/foo.png",
      element: {
        name: "image-element",
        parent: section,
        left: makeConstExpression(10),
        right: makeConstExpression(110),
        width: makeConstExpression(100),
        top: makeConstExpression(20),
        bottom: makeConstExpression(70),
        height: makeConstExpression(50),
        viewFactory: nullViewFactory,
        contentDependentDimension: ContentDependentDimension.None,
      },
    });

    section._setElements([image]);

    const geometry = new PresentationGeometry({
      basisWidth: 640,
      basisHeight: 480,
    });

    const presentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry,
    });

    presentation._setSections([section]);

    expect(presentation.sections[0]!.elements[0]).toBeInstanceOf(ImageElement);
    const builtImage = presentation.sections[0]!.elements[0] as ImageElement;
    expect(builtImage.source).toBe("images/foo.png");
  });

  it("supports HTMLFragmentElement instances within sections", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry: dummyGeometry,
    });

    const section = new Section({
      name: "Section with HTML element",
      parent: dummyPresentation,
      sectionTop: makeConstExpression(0),
      sectionHeight: makeConstExpression(100),
      sectionBottom: makeConstExpression(100),
      elements: [],
      viewFactory: nullViewFactory,
    });

    const fragment = document.createDocumentFragment();
    const span = document.createElement("span");
    span.textContent = "hello";
    fragment.appendChild(span);

    const htmlElement = new HTMLFragmentElement({
      fragment,
      element: {
        name: "html-element",
        parent: section,
        left: makeConstExpression(10),
        right: makeConstExpression(110),
        width: makeConstExpression(100),
        top: makeConstExpression(20),
        bottom: makeConstExpression(70),
        height: makeConstExpression(50),
        contentDependentDimension: ContentDependentDimension.None,
        viewFactory: nullViewFactory,
      },
    });

    section._setElements([htmlElement]);

    const geometry = new PresentationGeometry({
      basisWidth: 640,
      basisHeight: 480,
    });

    const presentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry,
    });

    presentation._setSections([section]);

    expect(presentation.sections[0]!.elements[0]).toBeInstanceOf(
      HTMLFragmentElement,
    );
    const builtElement = presentation.sections[0]!
      .elements[0] as HTMLFragmentElement;
    expect(builtElement.fragment.childNodes.length).toBe(1);
  });

  it("evaluates ScrollTrigger start and end via expressions", () => {
    const geometry = new PresentationGeometry({
      basisWidth: 640,
      basisHeight: 480,
    });

    const presentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry,
    });

    const trigger = new ScrollTrigger({
      presentation,
      start: makeConstExpression(100),
      end: makeConstExpression(300),
    });

    expect(trigger.start).toBe(100);
    expect(trigger.end).toBe(300);
  });

  it("attaches scroll triggers to elements", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry: dummyGeometry,
    });

    const section = new Section({
      name: "Section with trigger element",
      parent: dummyPresentation,
      sectionTop: makeConstExpression(0),
      sectionHeight: makeConstExpression(100),
      sectionBottom: makeConstExpression(100),
      elements: [],
      viewFactory: nullViewFactory,
    });

    const trigger = new ScrollTrigger({
      presentation: dummyPresentation,
      start: makeConstExpression(10),
      end: makeConstExpression(20),
    });

    const element = new Element({
      name: "element-with-trigger",
      parent: section,
      left: makeConstExpression(0),
      right: makeConstExpression(100),
      width: makeConstExpression(100),
      top: makeConstExpression(0),
      bottom: makeConstExpression(50),
      height: makeConstExpression(50),
      scrollTriggers: [trigger],
      viewFactory: nullViewFactory,
      contentDependentDimension: ContentDependentDimension.None,
    });

    expect(element.scrollTriggers.length).toBe(1);
    expect(element.scrollTriggers[0]).toBe(trigger);

    // Attach the element to the section so that Presentation can see it
    // when aggregating scroll triggers.
    section._setElements([element]);

    const geometry = new PresentationGeometry();

    const presentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry,
    });

    presentation._setSections([section]);

    const allTriggers = presentation.scrollTriggers as ScrollTrigger[];
    expect(allTriggers.length).toBe(1);
    expect(allTriggers[0]).toBe(trigger);
  });

  it("lazily creates ElementTransform when animated is enabled", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry: dummyGeometry,
    });

    const section = new Section({
      name: "Section with animated element",
      parent: dummyPresentation,
      sectionTop: makeConstExpression(0),
      sectionHeight: makeConstExpression(100),
      sectionBottom: makeConstExpression(100),
      elements: [],
      viewFactory: nullViewFactory,
    });

    const element = new Element({
      name: "animatable-element",
      parent: section,
      left: makeConstExpression(0),
      right: makeConstExpression(100),
      width: makeConstExpression(100),
      top: makeConstExpression(0),
      bottom: makeConstExpression(50),
      height: makeConstExpression(50),
      viewFactory: nullViewFactory,
      contentDependentDimension: ContentDependentDimension.None,
    });

    expect(element.animated).toBe(false);
    expect(element.transform).toBeNull();

    element.animated = true;

    expect(element.animated).toBe(true);
    expect(element.transform).toBeInstanceOf(ElementTransform);

    // Setting animated to true again should not recreate the transform
    const existingTransform = element.transform;
    element.animated = true;
    expect(element.transform).toBe(existingTransform);
  });

  it("lazily creates SectionTransform when animated is enabled", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      viewFactory: nullViewFactory,
      geometry: dummyGeometry,
    });

    const section = new Section({
      name: "animatable-section",
      parent: dummyPresentation,
      sectionTop: makeConstExpression(0),
      sectionHeight: makeConstExpression(100),
      sectionBottom: makeConstExpression(100),
      elements: [],
      viewFactory: nullViewFactory,
    });

    expect(section.animated).toBe(false);
    expect(section.transform).toBeNull();

    section.animated = true;

    expect(section.animated).toBe(true);
    expect(section.transform).toBeInstanceOf(SectionTransform);

    const existingTransform = section.transform;
    section.animated = true;
    expect(section.transform).toBe(existingTransform);
  });
});
