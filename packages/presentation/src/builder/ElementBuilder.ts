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

import type { ViewFactory } from "../view/ViewFactory";
import type { Section } from "../Section";
import { Element } from "../Element";
import { Phase, type PhaseType } from "./PresentationBuilder";

interface LayoutSlot {
	unbound: UnboundExpression | null;
	dependent: DependentExpression | null;
}

type LayoutKey = "left" | "right" | "width" | "top" | "bottom" | "height";

type Layout = Record<LayoutKey, LayoutSlot>;

interface ElementBuilderOptions {
	parent: { phase: PhaseType; bindingContext: DefaultBindingContext };
	bindingContext: DefaultBindingContext;
	viewFactory: ViewFactory;
}

/**
 * Builder for an Element within a Section.
 */
export class ElementBuilder {

	private readonly parent:
		| { phase: PhaseType; bindingContext: DefaultBindingContext };
	private readonly bindingContextInternal: DefaultBindingContext;
	private readonly viewFactory: ViewFactory;
	private readonly layout: Layout;

	constructor(options: ElementBuilderOptions) {
		const { parent, bindingContext, viewFactory } = options;
		this.parent = parent;
		this.bindingContextInternal = bindingContext;
		this.viewFactory = viewFactory;
		this.layout = {
			left: { unbound: null, dependent: null },
			right: { unbound: null, dependent: null },
			width: { unbound: null, dependent: null },
			top: { unbound: null, dependent: null },
			bottom: { unbound: null, dependent: null },
			height: { unbound: null, dependent: null },
		};
	}

	get bindingContext(): DefaultBindingContext {
		return this.bindingContextInternal;
	}

	get phase(): PhaseType {
		return this.parent.phase;
	}

	private checkPhase(required: PhaseType, methodName: string): void {
		if (this.parent.phase !== required) {
			throw new Error(
				`ElementBuilder.${methodName}: Cannot be called in current phase`,
			);
		}
	}

	// --- Setters for expressions ---
	setLeft(expr: string): void {
		this.setLayoutExpression("left", expr);
	}

	setRight(expr: string): void {
		this.setLayoutExpression("right", expr);
	}

	setWidth(expr: string): void {
		this.setLayoutExpression("width", expr);
	}

	setTop(expr: string): void {
		this.setLayoutExpression("top", expr);
	}

	setBottom(expr: string): void {
		this.setLayoutExpression("bottom", expr);
	}

	setHeight(expr: string): void {
		this.setLayoutExpression("height", expr);
	}

	private setLayoutExpression(slot: LayoutKey, exprStr: string): void {
		this.checkPhase(Phase.UNBOUND, "setLayoutExpression");

		if (!exprStr || typeof exprStr !== "string") {
			throw new Error(
				`ElementBuilder: Invalid expression string for ${slot}`,
			);
		}
		this.layout[slot].unbound = parseExpression(exprStr);
	}

	beforeBinding(): void {
		this.checkPhase(Phase.UNBOUND, "beforeBinding");

		// ----- HORIZONTAL VALIDATION -----
		const hasLeft = this.layout.left.unbound !== null;
		const hasWidth = this.layout.width.unbound !== null;
		const hasRight = this.layout.right.unbound !== null;
		const horizontalCount = [hasLeft, hasWidth, hasRight].filter(Boolean)
			.length;

		if (horizontalCount !== 2) {
			throw new Error(
				"ElementBuilder: Must specify exactly 2 of 3 horizontal properties (left, width, right)",
			);
		}

		// ----- VERTICAL VALIDATION -----
		const hasTop = this.layout.top.unbound !== null;
		const hasHeight = this.layout.height.unbound !== null;
		const hasBottom = this.layout.bottom.unbound !== null;
		const verticalCount = [hasTop, hasHeight, hasBottom].filter(Boolean)
			.length;

		if (verticalCount !== 2) {
			throw new Error(
				"ElementBuilder: Must specify exactly 2 of 3 vertical properties (top, height, bottom)",
			);
		}

		// ----- DERIVE MISSING HORIZONTAL PROPERTY -----
		if (!hasLeft) {
			this.layout.left.unbound = parseExpression("right - width");
		} else if (!hasWidth) {
			this.layout.width.unbound = parseExpression("right - left");
		} else if (!hasRight) {
			this.layout.right.unbound = parseExpression("left + width");
		}

		// ----- DERIVE MISSING VERTICAL PROPERTY -----
		if (!hasTop) {
			this.layout.top.unbound = parseExpression("bottom - height");
		} else if (!hasHeight) {
			this.layout.height.unbound = parseExpression("bottom - top");
		} else if (!hasBottom) {
			this.layout.bottom.unbound = parseExpression("top + height");
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
			this.bindingContextInternal.addExpression(
				prop,
				NameType.VALUE,
				this.layout[prop].unbound!,
			);
		}
	}

	bindExpressions(): DependentExpression[] {
		this.checkPhase(Phase.BINDING, "bindExpressions");

		const depExprs: DependentExpression[] = [];

		for (const slot of Object.values(this.layout)) {
			if (slot.unbound) {
				slot.dependent = slot.unbound.bind(this.bindingContextInternal);
				depExprs.push(slot.dependent);
			}
		}

		return depExprs;
	}

	build(options: { parent: Section }): Element {
		this.checkPhase(Phase.BOUND, "build");

		const { parent } = options;

		const left = this.layout.left.dependent!.expression as Expression;
		const right = this.layout.right.dependent!.expression as Expression;
		const width = this.layout.width.dependent!.expression as Expression;
		const top = this.layout.top.dependent!.expression as Expression;
		const bottom = this.layout.bottom.dependent!.expression as Expression;
		const height = this.layout.height.dependent!.expression as Expression;

		return new Element({
			parent,
			left,
			right,
			width,
			top,
			bottom,
			height,
			viewFactory: this.viewFactory,
		});
	}
}

