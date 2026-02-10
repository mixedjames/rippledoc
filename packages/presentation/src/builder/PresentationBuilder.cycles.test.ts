import { describe, it, expect } from "vitest";
import { PresentationBuilder } from "./PresentationBuilder";
import { nullViewFactory } from "../view/NullViewFactory";

describe("PresentationBuilder – cyclic dependency detection", () => {
	it("throws when element layout expressions form a cycle", () => {
		const builder = new PresentationBuilder({
			viewFactory: nullViewFactory,
		});

		const section = builder.createSection();
		section.setHeight("100");

		const el = section.createElement();

		// Create a simple cycle:
		// left = right + 10
		// right = left + 10
		el.setLeft("right + 10");
		el.setRight("left + 10");

		el.setTop("0");
		el.setHeight("10");

		expect(() => {
			builder.build();
		}).toThrow();
	});
});
