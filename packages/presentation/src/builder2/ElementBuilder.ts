import { Module } from "@expressions";
import type { Expression } from "@expressions";

import type { ViewFactory } from "../view/ViewFactory";
import type { Section } from "../Section";
import { Element } from "../Element";

/**
 * Layout properties supported by an Element.
 */
type LayoutKey =
	| "left"
	| "right"
	| "width"
	| "top"
	| "bottom"
	| "height";

/**
 * Builder for an Element within a Section.
 *
 * Responsibilities:
 * - Collect layout intent as expressions (strings)
 * - Validate layout constraints
 * - Derive missing layout expressions
 * - Expose bound expressions after module compilation
 *
 * This builder has no knowledge of expression phases.
 */
export class ElementBuilder {
	private readonly module: Module;
	private readonly viewFactory: ViewFactory;

	private readonly expressions = new Map<LayoutKey, string>();
	private readonly getters = new Map<LayoutKey, () => Expression>();

	private built = false;

	constructor(options: {
		parentModule: Module;
		viewFactory: ViewFactory;
	}) {
		const { parentModule, viewFactory } = options;

		this.module = parentModule.addSubModule();
		this.viewFactory = viewFactory;
	}

	// ─────────────────────────────────────────────────────────────
	// Construction-phase API
	// ─────────────────────────────────────────────────────────────

	setLeft(expr: string): void {
		this.setExpression("left", expr);
	}

	setRight(expr: string): void {
		this.setExpression("right", expr);
	}

	setWidth(expr: string): void {
		this.setExpression("width", expr);
	}

	setTop(expr: string): void {
		this.setExpression("top", expr);
	}

	setBottom(expr: string): void {
		this.setExpression("bottom", expr);
	}

	setHeight(expr: string): void {
		this.setExpression("height", expr);
	}

	private setExpression(key: LayoutKey, expr: string): void {
		this.assertNotBuilt("setExpression");

		if (!expr || typeof expr !== "string") {
			throw new Error(`ElementBuilder: Invalid expression for ${key}`);
		}

		this.expressions.set(key, expr);
	}

	/**
	 * Finalizes layout intent:
	 * - Validates constraints
	 * - Derives missing expressions
	 * - Registers expressions with the module
	 *
	 * Must be called before module compilation.
	 */
	finalize(): void {
		this.assertNotBuilt("finalize");

		this.validateAndDeriveLayout();
		this.registerExpressions();
	}

	// ─────────────────────────────────────────────────────────────
	// Build phase
	// ─────────────────────────────────────────────────────────────

	build(options: { parent: Section }): Element {
		this.assertNotBuilt("build");
		this.built = true;

		const { parent } = options;

		return new Element({
			parent,
			left: this.get("left"),
			right: this.get("right"),
			width: this.get("width"),
			top: this.get("top"),
			bottom: this.get("bottom"),
			height: this.get("height"),
			viewFactory: this.viewFactory,
		});
	}

	// ─────────────────────────────────────────────────────────────
	// Internal helpers
	// ─────────────────────────────────────────────────────────────

	private get(key: LayoutKey): Expression {
		const getter = this.getters.get(key);
		if (!getter) {
			throw new Error(`ElementBuilder: Expression '${key}' not registered`);
		}
		return getter();
	}

	private registerExpressions(): void {
		const keys: LayoutKey[] = [
			"left",
			"right",
			"width",
			"top",
			"bottom",
			"height",
		];

		for (const key of keys) {
			const expr = this.expressions.get(key);
			if (!expr) {
				throw new Error(`Missing layout expression: ${key}`);
			}

			const getter = this.module.addExpression(key, expr);
			this.getters.set(key, getter);
		}
	}

	private validateAndDeriveLayout(): void {
		// ----- Horizontal -----
		const hasLeft = this.expressions.has("left");
		const hasWidth = this.expressions.has("width");
		const hasRight = this.expressions.has("right");

		const horizontalCount = [hasLeft, hasWidth, hasRight].filter(Boolean)
			.length;

		if (horizontalCount !== 2) {
			throw new Error(
				"ElementBuilder: Must specify exactly 2 of (left, width, right)",
			);
		}

		if (!hasLeft) {
			this.expressions.set("left", "right - width");
		} else if (!hasWidth) {
			this.expressions.set("width", "right - left");
		} else if (!hasRight) {
			this.expressions.set("right", "left + width");
		}

		// ----- Vertical -----
		const hasTop = this.expressions.has("top");
		const hasHeight = this.expressions.has("height");
		const hasBottom = this.expressions.has("bottom");

		const verticalCount = [hasTop, hasHeight, hasBottom].filter(Boolean)
			.length;

		if (verticalCount !== 2) {
			throw new Error(
				"ElementBuilder: Must specify exactly 2 of (top, height, bottom)",
			);
		}

		if (!hasTop) {
			this.expressions.set("top", "bottom - height");
		} else if (!hasHeight) {
			this.expressions.set("height", "bottom - top");
		} else if (!hasBottom) {
			this.expressions.set("bottom", "top + height");
		}
	}

	private assertNotBuilt(method: string): void {
		if (this.built) {
			throw new Error(
				`ElementBuilder.${method}: Builder is no longer usable after build()`,
			);
		}
	}
}
