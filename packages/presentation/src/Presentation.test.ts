import { describe, it, expect } from "vitest";
import { Expression } from "@rippledoc/expressions";

import { Presentation } from "./Presentation";
import { PresentationGeometry } from "./PresentationGeometry";
import { Section } from "./Section";
import { Element } from "./Element";
import { ImageElement } from "./ImageElement";
import { ScrollTriggerDescriptor } from "./ScrollTriggerDescriptor";
import { ElementTransform } from "./ElementTransform";
import { SectionTransform } from "./SectionTransform";
import { nullViewFactory } from "./view/NullViewFactory";

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
      sections: [],
      viewFactory: nullViewFactory,
      geometry,
    });

    expect(presentation.slideWidth).toBe(800);
    expect(presentation.slideHeight).toBe(600);
  });

  it("returns sections array and view instance", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      sections: [],
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
      sections: [section],
      viewFactory: nullViewFactory,
      geometry,
    });

    expect(presentation.sections).toHaveLength(1);
    expect(presentation.sections[0]).toBe(section);
    expect(presentation.view).toBeDefined();
  });

  it("delegates display.realise and display.layout to sections and views", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      sections: [],
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
      viewFactory: nullViewFactory,
    });
    section._setElements([element]);
    const geometry = new PresentationGeometry({
      basisWidth: 640,
      basisHeight: 480,
    });

    const presentation = new Presentation({
      sections: [section],
      viewFactory: nullViewFactory,
      geometry,
    });

    // Should not throw and should traverse the tree.
    presentation.display.realise();
    presentation.display.layout();
  });

  it("supports ImageElement instances within sections", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      sections: [],
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
      },
    });

    section._setElements([image]);

    const geometry = new PresentationGeometry({
      basisWidth: 640,
      basisHeight: 480,
    });

    const presentation = new Presentation({
      sections: [section],
      viewFactory: nullViewFactory,
      geometry,
    });

    expect(presentation.sections[0]!.elements[0]).toBeInstanceOf(ImageElement);
    const builtImage = presentation.sections[0]!.elements[0] as ImageElement;
    expect(builtImage.source).toBe("images/foo.png");
  });

  it("evaluates ScrollTriggerDescriptor start and end via expressions", () => {
    const geometry = new PresentationGeometry({
      basisWidth: 640,
      basisHeight: 480,
    });

    const presentation = new Presentation({
      sections: [],
      viewFactory: nullViewFactory,
      geometry,
    });

    const trigger = new ScrollTriggerDescriptor({
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
      sections: [],
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

    const trigger = new ScrollTriggerDescriptor({
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
    });

    expect(element.scrollTriggers.length).toBe(1);
    expect(element.scrollTriggers[0]).toBe(trigger);

    // Attach the element to the section so that Presentation can see it
    // when aggregating scroll triggers.
    section._setElements([element]);

    const geometry = new PresentationGeometry();
    const presentation = new Presentation({
      sections: [section],
      viewFactory: nullViewFactory,
      geometry,
    });

    const allTriggers =
      presentation.scrollTriggers as ScrollTriggerDescriptor[];
    expect(allTriggers.length).toBe(1);
    expect(allTriggers[0]).toBe(trigger);
  });

  it("lazily creates ElementTransform when animated is enabled", () => {
    const dummyGeometry = new PresentationGeometry();
    const dummyPresentation = new Presentation({
      sections: [],
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
      sections: [],
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
