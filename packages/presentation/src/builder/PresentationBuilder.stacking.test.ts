import { describe, it, expect } from "vitest";
import { PresentationBuilder } from "./PresentationBuilder";
import { nullViewFactory } from "../view/NullViewFactory";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe("PresentationBuilder – section stacking invariants", () => {
  it("stacks sections contiguously for random heights", () => {
    for (let run = 0; run < 25; run++) {
      const builder = new PresentationBuilder({
        viewFactory: nullViewFactory,
      });

      const heights: number[] = [];

      const sectionCount = randomInt(1, 10);
      for (let i = 0; i < sectionCount; i++) {
        const h = randomInt(10, 300);
        heights.push(h);

        const section = builder.createSection();
        section.setHeight(String(h));
      }

      const presentation = builder.build();

      let expectedTop = 0;

      for (let i = 0; i < sectionCount; i++) {
        const section = presentation.sections[i]!;

        const top = section.sectionTop;
        const bottom = section.sectionBottom;
        const height = section.sectionHeight;

        expect(top).toBe(expectedTop);
        expect(height).toBe(heights[i]);
        expect(bottom).toBe(top + height);

        expectedTop = bottom;
      }
    }
  });
});
