import { describe, it, expect } from "vitest";
import { resolveExpressions } from "@expressions";

import { PresentationBuilder, Phase } from "./PresentationBuilder";
import { nullViewFactory } from "../view/NullViewFactory";

describe("PresentationBuilder", () => {
	it("builds a presentation with a single section and element", () => {
		const builder = new PresentationBuilder({ viewFactory: nullViewFactory });

		builder.setSlideWidth(800);
		builder.setSlideHeight(600);

		const section = builder.createSection();
		section.setHeight("200");

		const element = section.createElement();
		// Two of three horizontal and vertical properties
		element.setLeft("10");
		element.setWidth("100");
		element.setTop("20");
		element.setHeight("50");

		const deps = builder.bindExpressions();
		const resolved = resolveExpressions(deps);

		// Evaluate once to ensure expressions are valid
		resolved.forEach((expr) => {
			expect(() => expr.evaluate()).not.toThrow();
		});

		const presentation = builder.build();

		expect(builder.currentPhase).toBe(Phase.BUILT);
		expect(presentation.slideWidth).toBe(800);
		expect(presentation.slideHeight).toBe(600);
		expect(presentation.sections).toHaveLength(1);
		const builtSection = presentation.sections[0];
		expect(builtSection.elements).toHaveLength(1);
	});

	it("enforces phase transitions", () => {
		const builder = new PresentationBuilder({ viewFactory: nullViewFactory });

		builder.setSlideWidth(640);
		builder.setSlideHeight(480);
		builder.createSection().setHeight("100");
		builder.bindExpressions();

		// After binding, creating new sections should fail
		expect(() => builder.createSection()).toThrow(/Cannot be called in current phase/);
	});
});
