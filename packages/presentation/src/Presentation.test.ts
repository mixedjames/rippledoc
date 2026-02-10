import { describe, it, expect } from "vitest";
import { Expression } from "@expressions";

import { Presentation, PresentationGeometry } from "./Presentation";
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
	it("exposes slide dimensions from geometry", () => {
		const geometry = new PresentationGeometry();
		geometry.basis.width = 800;
		geometry.basis.height = 600;

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

		const geometry = new PresentationGeometry();
		geometry.basis.width = 1024;
		geometry.basis.height = 768;

		const presentation = new Presentation({
			sections: [section],
			viewFactory: nullViewFactory,
			geometry,
		});

		expect(presentation.sections).toHaveLength(1);
		expect(presentation.sections[0]).toBe(section);
		expect(presentation.view).toBeDefined();
	});

	it("delegates realiseView and layoutView to sections and views", () => {
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
		const geometry = new PresentationGeometry();
		geometry.basis.width = 640;
		geometry.basis.height = 480;

		const presentation = new Presentation({
			sections: [section],
			viewFactory: nullViewFactory,
			geometry,
		});

		// Should not throw and should traverse the tree.
		presentation.realiseView();
		presentation.layoutView();
	});
});
