import { describe, it, expect } from "vitest";
import { PresentationBuilder } from "./PresentationBuilder";
import { nullViewFactory } from "../view/NullViewFactory";
import { Element } from "../Element";

describe("PresentationBuilder – happy path", () => {
	it("builds a presentation with a single section", () => {
		const builder = new PresentationBuilder({
			viewFactory: nullViewFactory,
		});

		// One section, minimal valid configuration
		const section = builder.createSection();
		section.setHeight("100");

		// Compile + build
		const presentation = builder.build();

		// --- Presentation ---
		expect(presentation.sections.length).toBe(1);
		expect(presentation.slideWidth).toBe(640);
		expect(presentation.slideHeight).toBe(480);

		// --- Section ---
		const builtSection = presentation.sections[0]!;

		expect(builtSection.sectionTop).toBe(0);
		expect(builtSection.sectionHeight).toBe(100);
		expect(builtSection.sectionBottom).toBe(100);
	});
});


it("builds a presentation with two stacked sections and one element", () => {
	const builder = new PresentationBuilder({
		viewFactory: nullViewFactory,
	});

	// ----- Section 1 -----
	const section1 = builder.createSection();
	section1.setHeight("100");

	const el1 = section1.createElement();
	el1.setLeft("10");
	el1.setWidth("50");
	el1.setTop("10");
	el1.setHeight("20");

	// ----- Section 2 -----
	const section2 = builder.createSection();
	section2.setHeight("200");

	// Compile + build
	const presentation = builder.build();

	// --- Sections ---
	expect(presentation.sections.length).toBe(2);

	const s1 = presentation.sections[0]!;
	const s2 = presentation.sections[1]!;

	expect(s1.sectionTop).toBe(0);
	expect(s1.sectionBottom).toBe(100);

	expect(s2.sectionTop).toBe(100);
	expect(s2.sectionBottom).toBe(300);

	// --- Element ---
	expect(s1.elements.length).toBe(1);
	const element = s1.elements[0]!;

	expect(element.left).toBe(10);
	expect(element.width).toBe(50);
	expect(element.right).toBe(60);

	expect(element.top).toBe(10);
	expect(element.height).toBe(20);
	expect(element.bottom).toBe(30);
});

describe("PresentationBuilder – happy paths", () => {
	it("builds a section with two stacked elements", () => {
		const builder = new PresentationBuilder({
			viewFactory: nullViewFactory,
		});

		// Section 1 – only set height (top is implied)
		const section = builder.createSection();
		section.setHeight("200");

		// Element 1
		const el1 = section.createElement();
		el1.setTop("0");
		el1.setHeight("50");
		el1.setLeft("0");
		el1.setWidth("100");

		// Element 2 – stacked below first element
		const el2 = section.createElement();
		el2.setTop("prevElement.bottom");
		el2.setHeight("30");
		el2.setLeft("0");
		el2.setWidth("100");

    const presentation = builder.build();

		const builtSection = presentation.sections[0]!;
		const [e1, e2] = builtSection.elements as Element[];

		// --- Assertions ---

		// vertical stacking
		expect(e2!.top).toBe(e1!.bottom);

		// horizontal alignment
		expect(e2!.left).toBe(e1!.left);
		expect(e2!.width).toBe(e1!.width);

		// sanity checks
		expect(e1!.bottom).toBe(e1!.top + 50);
		expect(e2!.bottom).toBe(e2!.top + 30);

		// section layout
		expect(builtSection.sectionTop).toBe(0);
		expect(builtSection.sectionHeight).toBe(200);
		expect(builtSection.sectionBottom).toBe(builtSection.sectionTop + 200);

	});
});
