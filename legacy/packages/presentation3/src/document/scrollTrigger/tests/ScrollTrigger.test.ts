import { describe, expect, it } from "vitest";
import { constant, offsetFrom } from "../../../anchors/index";
import { createPresentation } from "../../presentation/Presentation";
import { ScrollTrigger } from "../ScrollTrigger";

describe("scroll trigger vertical anchors", () => {
  it("derives bottom from top + height", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    const trigger = new ScrollTrigger({
      parent: section,
      top: constant(100),
      height: constant(300),
      name: "intro",
    });

    expect(trigger.name).toBe("intro");
    expect(trigger.top).toBe(100);
    expect(trigger.height).toBe(300);
    expect(trigger.bottom).toBe(400);
    expect(trigger.deltaY).toBe(300);
  });

  it("derives top from bottom - height", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    const trigger = new ScrollTrigger({
      parent: section,
      bottom: constant(500),
      height: constant(200),
    });

    expect(trigger.top).toBe(300);
    expect(trigger.bottom).toBe(500);
    expect(trigger.height).toBe(200);
  });

  it("supports updating vertical constraints with anchor dependencies", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    const trigger = new ScrollTrigger({
      parent: section,
      top: constant(50),
      bottom: constant(250),
    });

    trigger.setVerticalAnchors({
      top: offsetFrom(section.topAnchor, 20),
      height: constant(180),
    });

    expect(trigger.top).toBe(20);
    expect(trigger.height).toBe(180);
    expect(trigger.bottom).toBe(200);
  });

  it("throws when vertical constraints are not exactly two values", () => {
    const presentation = createPresentation({
      basisWidth: 1000,
      basisHeight: 800,
    });
    const section = presentation.addSection();

    expect(() => {
      new ScrollTrigger({
        parent: section,
        top: constant(10),
      });
    }).toThrow(/exactly two constraints/i);

    const trigger = new ScrollTrigger({
      parent: section,
      top: constant(10),
      bottom: constant(20),
    });

    expect(() => {
      trigger.setVerticalAnchors({
        top: constant(0),
        bottom: constant(10),
        height: constant(10),
      });
    }).toThrow(/exactly two constraints/i);
  });
});
