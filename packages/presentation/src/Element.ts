import type { Expression } from "@expressions";

import type { Section } from "./Section";
import type { ElementView } from "./view/ElementView";
import type { ViewFactory } from "./view/ViewFactory";

/**
 * Represents an immutable element with layout properties.
 *
 * **DO NOT construct directly.** Use ElementBuilder instead:
 * - {@link ElementBuilder} for programmatic construction
 *
 * Elements are created through SectionBuilder:
 * @example
 * // Correct usage
	 * const section = presentationBuilder.createSection();
 * const element = section.createElement();
 * element.setLeft("10");
 * element.setWidth("100");
 * element.setTop("20");
 * element.setHeight("50");
 * // ... then build the document
 */
export class Element {

	private readonly leftExpr: Expression;
	private readonly rightExpr: Expression;
	private readonly widthExpr: Expression;
	private readonly topExpr: Expression;
	private readonly bottomExpr: Expression;
	private readonly heightExpr: Expression;

	private readonly parentInternal: Section | null;
	private readonly viewInternal: ElementView;

	/**
	 * @param options.left Left position expression.
	 * @param options.right Right position expression.
	 * @param options.width Width expression.
	 * @param options.top Top position expression.
	 * @param options.bottom Bottom position expression.
	 * @param options.height Height expression.
	 * @param options.parent Parent section.
	 * @param options.viewFactory Factory for creating views.
	 * @internal Use ElementBuilder instead.
	 */
	constructor(options: {
		left: Expression;
		right: Expression;
		width: Expression;
		top: Expression;
		bottom: Expression;
		height: Expression;
		parent?: Section | null;
		viewFactory: ViewFactory;
	}) {
		const {
			left,
			right,
			width,
			top,
			bottom,
			height,
			parent = null,
			viewFactory,
		} = options;

		// All 6 properties should be provided as Expression objects
		if (!left || !right || !width || !top || !bottom || !height) {
			throw new Error(
				"Element: All layout properties (left, right, width, top, bottom, height) must be provided",
			);
		}

		this.leftExpr = left;
		this.rightExpr = right;
		this.widthExpr = width;
		this.topExpr = top;
		this.bottomExpr = bottom;
		this.heightExpr = height;

		this.parentInternal = parent;
		this.viewInternal = viewFactory.createElementView(this);
	}

	realiseView(): void {
		this.viewInternal.realise();
	}

	layoutView(): void {
		this.viewInternal.layout();
	}

	/**
	 * Get the left position value (evaluates the left expression).
	 * @returns The left position in pixels.
	 */
	get left(): number {
		return this.leftExpr.evaluate();
	}

	/**
	 * Get the right position value (evaluates the right expression).
	 * @returns The right position in pixels.
	 */
	get right(): number {
		return this.rightExpr.evaluate();
	}

	/**
	 * Get the width value (evaluates the width expression).
	 * @returns The width in pixels.
	 */
	get width(): number {
		return this.widthExpr.evaluate();
	}

	/**
	 * Get the top position value (evaluates the top expression).
	 * @returns The top position in pixels.
	 */
	get top(): number {
		return this.topExpr.evaluate();
	}

	/**
	 * Get the bottom position value (evaluates the bottom expression).
	 * @returns The bottom position in pixels.
	 */
	get bottom(): number {
		return this.bottomExpr.evaluate();
	}

	/**
	 * Get the height value (evaluates the height expression).
	 * @returns The height in pixels.
	 */
	get height(): number {
		return this.heightExpr.evaluate();
	}

	/**
	 * Get the parent section of this element.
	 * @returns The parent section.
	 */
	get parent(): Section | null {
		return this.parentInternal;
	}

	/**
	 * Get the view associated with this element.
	 * @returns The element's view object.
	 */
	get view(): ElementView {
		return this.viewInternal;
	}
}
