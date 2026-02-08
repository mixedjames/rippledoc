import { Module } from "@expressions";
import type { Expression } from "@expressions";

import type { ViewFactory } from "../view/ViewFactory";
import type { Presentation } from "../Presentation";
import { Section } from "../Section";
import { ElementBuilder } from "./ElementBuilder";

/**
 * Builder for a Section within a Presentation.
 * 
 * Responsibilities:
 * - Collect section layout intent as expressions (strings)
 * - Collect ElementBuilder children
 * - Validate constraints and derive missing expressions
 * - Register expressions with its own Module
 */
export class SectionBuilder {
	private readonly module: Module;
	private readonly viewFactory: ViewFactory;
	private readonly elements: ElementBuilder[] = [];

	private prevSectionBuilder: SectionBuilder | null = null;
	private nextSectionBuilder: SectionBuilder | null = null;

	private readonly expressions = new Map<
		"sectionTop" | "sectionHeight" | "sectionBottom",
		string
	>();

	private getters = new Map<"sectionTop" | "sectionHeight" | "sectionBottom", () => Expression>();

	private built = false;

	constructor(options: { parentModule: Module; viewFactory: ViewFactory }) {
		const { parentModule, viewFactory } = options;
		this.module = parentModule.addSubModule();
		this.viewFactory = viewFactory;
	}

	// ─────────────────────────────────────────────────────────────
	// Construction-phase API
	// ─────────────────────────────────────────────────────────────

	setPrevious(prev: SectionBuilder): void {
		this.assertNotBuilt("setPrevious");
		this.prevSectionBuilder = prev;
	}

	setNext(next: SectionBuilder): void {
		this.assertNotBuilt("setNext");
		this.nextSectionBuilder = next;
	}

	setHeight(expr: string): void {
		this.assertNotBuilt("setHeight");
		if (this.expressions.has("sectionBottom")) {
			throw new Error("Cannot set both height and bottom");
		}
		this.expressions.set("sectionHeight", expr);
	}

	setBottom(expr: string): void {
		this.assertNotBuilt("setBottom");
		if (this.expressions.has("sectionHeight")) {
			throw new Error("Cannot set both height and bottom");
		}
		this.expressions.set("sectionBottom", expr);
	}

	createElement(): ElementBuilder {
		this.assertNotBuilt("createElement");
		const element = new ElementBuilder({
			parentModule: this.module,
			viewFactory: this.viewFactory,
		});
		this.elements.push(element);
		return element;
	}

	/**
	 * Finalizes section layout intent:
	 * - Derives missing expressions (top / height / bottom)
	 * - Registers all expressions with the module
	 */
	finalize(): void {
		this.assertNotBuilt("finalize");

		this.validateAndDeriveLayout();
		this.registerExpressions();

		// Recursively finalize children
		this.elements.forEach((el) => el.finalize());
	}

	// ─────────────────────────────────────────────────────────────
	// Build phase
	// ─────────────────────────────────────────────────────────────

	build(options: { parent: Presentation }): Section {
		this.assertNotBuilt("build");
		this.built = true;

		const { parent } = options;

		const section = new Section({
			parent,
			sectionTop: this.get("sectionTop"),
			sectionHeight: this.get("sectionHeight"),
			sectionBottom: this.get("sectionBottom"),
			elements: [],
			viewFactory: this.viewFactory,
		});

		const builtElements = this.elements.map((el) =>
			el.build({ parent: section })
		);

		section._setElements(builtElements);

		return section;
	}

	// ─────────────────────────────────────────────────────────────
	// Internal helpers
	// ─────────────────────────────────────────────────────────────

	private get(
		key: "sectionTop" | "sectionHeight" | "sectionBottom"
	): Expression {
		const getter = this.getters.get(key);
		if (!getter) {
			throw new Error(`SectionBuilder: Expression '${key}' not registered`);
		}
		return getter();
	}

	private validateAndDeriveLayout(): void {
		const hasHeight = this.expressions.has("sectionHeight");
		const hasBottom = this.expressions.has("sectionBottom");

		if (!hasHeight && !hasBottom) {
			throw new Error("Must specify either height or bottom");
		}

		// top is derived from previous section or zero
		if (this.prevSectionBuilder) {
			this.expressions.set("sectionTop", "prevSection.sectionBottom");
		} else {
			this.expressions.set("sectionTop", "0");
		}

		// derive missing property
		if (!hasBottom) {
			this.expressions.set(
				"sectionBottom",
				"sectionTop + sectionHeight"
			);
		} else if (!hasHeight) {
			this.expressions.set(
				"sectionHeight",
				"sectionBottom - sectionTop"
			);
		}
	}

	private registerExpressions(): void {
		const keys: Array<"sectionTop" | "sectionHeight" | "sectionBottom"> = [
			"sectionTop",
			"sectionHeight",
			"sectionBottom",
		];

		for (const key of keys) {
			const expr = this.expressions.get(key);
			if (!expr) {
				throw new Error(`Missing section expression: ${key}`);
			}
			const getter = this.module.addExpression(key, expr);
			this.getters.set(key, getter);
		}
	}

	private assertNotBuilt(method: string): void {
		if (this.built) {
			throw new Error(
				`SectionBuilder.${method}: Builder is no longer usable after build()`
			);
		}
	}
}
