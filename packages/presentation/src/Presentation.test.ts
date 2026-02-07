import { describe, it, expect } from "vitest";
import { Expression } from "@expressions";

import { Presentation } from "./Presentation";
import { Section } from "./Section";
import { Element } from "./Element";
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
	it("exposes slide dimensions via evaluated expressions", () => {
		const slideWidthExpr = makeConstExpression(800);
		const slideHeightExpr = makeConstExpression(600);

		const presentation = new Presentation({
			sections: [],
			slideWidth: slideWidthExpr,
			slideHeight: slideHeightExpr,
			viewFactory: nullViewFactory,
		});

		expect(presentation.slideWidth).toBe(800);
		expect(presentation.slideHeight).toBe(600);
	});

	it("returns sections array and view instance", () => {
		const slideWidthExpr = makeConstExpression(1024);
		const slideHeightExpr = makeConstExpression(768);

		const section = new Section({
			parent: null,
			sectionTop: makeConstExpression(0),
			sectionHeight: makeConstExpression(100),
			sectionBottom: makeConstExpression(100),
			elements: [],
			viewFactory: nullViewFactory,
		});

		const presentation = new Presentation({
			sections: [section],
			slideWidth: slideWidthExpr,
			slideHeight: slideHeightExpr,
			viewFactory: nullViewFactory,
		});

		expect(presentation.sections).toHaveLength(1);
		expect(presentation.sections[0]).toBe(section);
		expect(presentation.view).toBeDefined();
	});

	it("delegates realiseView and layoutView to sections and views", () => {
		const slideWidthExpr = makeConstExpression(640);
		const slideHeightExpr = makeConstExpression(480);

		const element = new Element({
			parent: null,
			left: makeConstExpression(10),
			right: makeConstExpression(110),
			width: makeConstExpression(100),
			top: makeConstExpression(20),
			bottom: makeConstExpression(70),
			height: makeConstExpression(50),
			viewFactory: nullViewFactory,
		});

		const section = new Section({
			parent: null,
			sectionTop: makeConstExpression(0),
			sectionHeight: makeConstExpression(100),
			sectionBottom: makeConstExpression(100),
			elements: [element],
			viewFactory: nullViewFactory,
		});

		const presentation = new Presentation({
			sections: [section],
			slideWidth: slideWidthExpr,
			slideHeight: slideHeightExpr,
			viewFactory: nullViewFactory,
		});

		// Should not throw and should traverse the tree.
		presentation.realiseView();
		presentation.layoutView();
	});
});
