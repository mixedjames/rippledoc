import { describe, expect, it } from "vitest";
import { Presentation } from "../presentation/Presentation";

describe("presentation3 document model", () => {
  it("creates full-width, stacked sections by default", () => {
    const presentation = new Presentation({
      slideWidth: 1200,
      slideHeight: 800,
    });

    const first = presentation.addSection();
    const second = presentation.addSection();

    expect(first.left).toBe(0);
    expect(first.right).toBe(1200);
    expect(first.top).toBe(0);
    expect(first.bottom).toBe(800);

    expect(second.top).toBe(800);
    expect(second.bottom).toBe(1600);
    expect(presentation.height).toBe(1600);
  });

  it("creates elements using fixed default percentages", () => {
    const presentation = new Presentation({
      slideWidth: 1000,
      slideHeight: 800,
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
});
