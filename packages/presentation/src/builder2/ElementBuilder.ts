// New descriptor-based Element builder (v2)
// This is intentionally phase-less: it only collects a description
// of an element's layout that can later be compiled/bound elsewhere.

import {
	DefaultBindingContext,
	NameType,
	parseExpression,
} from "@expressions";
import type {
	DependentExpression,
	UnboundExpression,
} from "@expressions";
import type { Expression } from "@expressions";

import { Element } from "../Element";
import type { Section } from "../Section";
import type { ViewFactory } from "../view/ViewFactory";

/**
 * Logical layout properties supported by an Element.
 */
export type LayoutKey = "left" | "right" | "width" | "top" | "bottom" | "height";

/**
 * A single layout property expressed as a string expression.
 *
 * For now we keep expressions as strings; the compiler step will
 * parse and bind them using the expressions library.
 */
export type LayoutExpressionString = string;

/**
 * Declarative description of an element's layout.
 *
 * Each property is optional; higher-level validation/derivation
 * (e.g. "exactly 2 of 3" rules) lives in the compiler step.
 */
export interface ElementLayoutSpec {
	left?: LayoutExpressionString;
	right?: LayoutExpressionString;
	width?: LayoutExpressionString;
	top?: LayoutExpressionString;
	bottom?: LayoutExpressionString;
	height?: LayoutExpressionString;
}

/**
 * High-level descriptor for an Element.
 *
 * This is intentionally minimal for now; additional properties
 * (ids, styles, content, etc.) can be added as the API evolves.
 */
export interface ElementSpec {
	layout: ElementLayoutSpec;
}

/**
 * User-facing builder for constructing an ElementSpec.
 *
 * This is the "builder2" equivalent of the legacy ElementBuilder,
 * but without runtime phases or binding concerns.
 */
export class ElementBuilder {
	private readonly layout: ElementLayoutSpec = {};

	setLeft(expr: LayoutExpressionString): this {
		this.layout.left = expr;
		return this;
	}

	setRight(expr: LayoutExpressionString): this {
		this.layout.right = expr;
		return this;
	}

	setWidth(expr: LayoutExpressionString): this {
		this.layout.width = expr;
		return this;
	}

	setTop(expr: LayoutExpressionString): this {
		this.layout.top = expr;
		return this;
	}

	setBottom(expr: LayoutExpressionString): this {
		this.layout.bottom = expr;
		return this;
	}

	setHeight(expr: LayoutExpressionString): this {
		this.layout.height = expr;
		return this;
	}

	/**
	 * Finalize and expose an immutable snapshot of the spec built so far.
	 */
	toSpec(): ElementSpec {
		// Return a shallow copy to avoid external mutation.
		return {
			layout: { ...this.layout },
		};
	}
}

// --------------------------------------------------
// Compiler step: ElementSpec -> Element
// --------------------------------------------------

interface LayoutSlot {
	unbound: UnboundExpression | null;
	dependent: DependentExpression | null;
}

export interface ElementCompileContext {
	bindingContext: DefaultBindingContext;
	viewFactory: ViewFactory;
	parent: Section;
}

export interface ElementCompileResult {
	/**
	 * All DependentExpressions produced for this element.
	 *
	 * These must be included in the global collection passed to
	 * resolveExpressions() so that dependency ordering and cycles
	 * can be handled before building the final Element.
	 */
	dependentExpressions: DependentExpression[];

	/**
	 * Construct the final Element instance.
	 *
	 * This assumes that resolveExpressions() has already been
	 * called on the full set of dependent expressions, so that
	 * each DependentExpression has a resolved Expression.
	 */
	buildElement(): Element;
}

/**
 * Compile an ElementSpec into a fully bound Element instance.
 *
 * This performs the same responsibilities as the legacy ElementBuilder:
 * - validates that exactly 2 of 3 horizontal/vertical properties are set
 * - derives the missing property using simple expressions
 * - registers all 6 layout properties in the binding context
 * - binds expressions and constructs an Element
 */
export function compileElement(
	spec: ElementSpec,
	ctx: ElementCompileContext,
): ElementCompileResult {
	const { layout } = spec;
	const { bindingContext, viewFactory, parent } = ctx;

	const slots: Record<LayoutKey, LayoutSlot> = {
		left: { unbound: null, dependent: null },
		right: { unbound: null, dependent: null },
		width: { unbound: null, dependent: null },
		top: { unbound: null, dependent: null },
		bottom: { unbound: null, dependent: null },
		height: { unbound: null, dependent: null },
	};

	function parseIfPresent(value: LayoutExpressionString | undefined, name: LayoutKey): UnboundExpression | null {
		if (value == null) {
			return null;
		}

		if (typeof value !== "string" || !value.trim()) {
			throw new Error(`ElementCompiler: Invalid expression string for ${name}`);
		}

		return parseExpression(value);
	}

	// Initial unbound expressions from the spec
	slots.left.unbound = parseIfPresent(layout.left, "left");
	slots.right.unbound = parseIfPresent(layout.right, "right");
	slots.width.unbound = parseIfPresent(layout.width, "width");
	slots.top.unbound = parseIfPresent(layout.top, "top");
	slots.bottom.unbound = parseIfPresent(layout.bottom, "bottom");
	slots.height.unbound = parseIfPresent(layout.height, "height");

	// ----- HORIZONTAL VALIDATION -----
	const hasLeft = slots.left.unbound !== null;
	const hasWidth = slots.width.unbound !== null;
	const hasRight = slots.right.unbound !== null;
	const horizontalCount = [hasLeft, hasWidth, hasRight].filter(Boolean).length;

	if (horizontalCount !== 2) {
		throw new Error(
			"ElementCompiler: Must specify exactly 2 of 3 horizontal properties (left, width, right)",
		);
	}

	// ----- VERTICAL VALIDATION -----
	const hasTop = slots.top.unbound !== null;
	const hasHeight = slots.height.unbound !== null;
	const hasBottom = slots.bottom.unbound !== null;
	const verticalCount = [hasTop, hasHeight, hasBottom].filter(Boolean).length;

	if (verticalCount !== 2) {
		throw new Error(
			"ElementCompiler: Must specify exactly 2 of 3 vertical properties (top, height, bottom)",
		);
	}

	// ----- DERIVE MISSING HORIZONTAL PROPERTY -----
	if (!hasLeft) {
		slots.left.unbound = parseExpression("right - width");
	} else if (!hasWidth) {
		slots.width.unbound = parseExpression("right - left");
	} else if (!hasRight) {
		slots.right.unbound = parseExpression("left + width");
	}

	// ----- DERIVE MISSING VERTICAL PROPERTY -----
	if (!hasTop) {
		slots.top.unbound = parseExpression("bottom - height");
	} else if (!hasHeight) {
		slots.height.unbound = parseExpression("bottom - top");
	} else if (!hasBottom) {
		slots.bottom.unbound = parseExpression("top + height");
	}

	// ----- REGISTER ALL LAYOUT PROPERTIES -----
	const properties: LayoutKey[] = [
		"left",
		"right",
		"width",
		"top",
		"bottom",
		"height",
	];

	for (const prop of properties) {
		bindingContext.addExpression(prop, NameType.VALUE, slots[prop].unbound!);
	}

	// ----- BIND EXPRESSIONS -----
	const dependentExpressions: DependentExpression[] = [];

	for (const slot of Object.values(slots)) {
		if (slot.unbound) {
			slot.dependent = slot.unbound.bind(bindingContext);
			dependentExpressions.push(slot.dependent);
		}
	}

	// At this point expressions are bound but not yet resolved.
	// We return a builder function that will read .expression
	// only after the caller has run resolveExpressions() on
	// the collected dependent expressions.
	const buildElement = (): Element => {
		const left = slots.left.dependent!.expression as Expression;
		const right = slots.right.dependent!.expression as Expression;
		const width = slots.width.dependent!.expression as Expression;
		const top = slots.top.dependent!.expression as Expression;
		const bottom = slots.bottom.dependent!.expression as Expression;
		const height = slots.height.dependent!.expression as Expression;

		return new Element({
			parent,
			left,
			right,
			width,
			top,
			bottom,
			height,
			viewFactory,
		});
	};

	return { dependentExpressions, buildElement };
}

