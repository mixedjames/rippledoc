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

	private readonly name_: string;

	private readonly left_: Expression;
	private readonly right_: Expression;
	private readonly width_: Expression;
	private readonly top_: Expression;
	private readonly bottom_: Expression;
	private readonly height_: Expression;

	private readonly parent_: Section;
	private readonly view_: ElementView;

	/**
	 * @param options.name Element name.
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
		name: string;
		left: Expression;
		right: Expression;
		width: Expression;
		top: Expression;
		bottom: Expression;
		height: Expression;
		parent: Section;
		viewFactory: ViewFactory;
	}) {
		const {
			name,
			left,
			right,
			width,
			top,
			bottom,
			height,
			parent,
			viewFactory,
		} = options;

		if (typeof name !== "string") {
			throw new Error("Element: name must be a string");
		}

		// All 6 properties should be provided as Expression objects
		if (!left || !right || !width || !top || !bottom || !height) {
			throw new Error(
				"Element: All layout properties (left, right, width, top, bottom, height) must be provided",
			);
		}

		if (!parent) {
			throw new Error("Element: parent section must be provided");
		}

		this.name_ = name;

		this.left_ = left;
		this.right_ = right;
		this.width_ = width;
		this.top_ = top;
		this.bottom_ = bottom;
		this.height_ = height;

		this.parent_ = parent;
		this.view_ = viewFactory.createElementView(this);
	}

	realiseView(): void {
		this.view_.realise();
	}

	layoutView(): void {
		this.view_.layout();
	}

	/**
	 * Get the element name.
	 * @returns The element name.
	 */
	get name(): string {
		return this.name_;
	}

	/**
	 * Get the left position value (evaluates the left expression).
	 * @returns The left position in presentation basis coordinates.
	 */
	get left(): number {
		return this.left_.evaluate();
	}

	/**
	 * Get the right position value (evaluates the right expression).
	 * @returns The right position in presentation basis coordinates.
	 */
	get right(): number {
		return this.right_.evaluate();
	}

	/**
	 * Get the width value (evaluates the width expression).
	 * @returns The width in presentation basis coordinates.
	 */
	get width(): number {
		return this.width_.evaluate();
	}

	/**
	 * Get the top position value (evaluates the top expression).
	 * @returns The top position in presentation basis coordinates.
	 */
	get top(): number {
		return this.top_.evaluate();
	}

	/**
	 * Get the bottom position value (evaluates the bottom expression).
	 * @returns The bottom position in presentation basis coordinates.
	 */
	get bottom(): number {
		return this.bottom_.evaluate();
	}

	/**
	 * Get the height value (evaluates the height expression).
	 * @returns The height in presentation basis coordinates.
	 */
	get height(): number {
		return this.height_.evaluate();
	}

	/**
	 * Get the parent section of this element.
	 * @returns The parent section.
	 */
	get parent(): Section {
		return this.parent_;
	}

	/**
	 * Get the view associated with this element.
	 * @returns The element's view object.
	 */
	get view(): ElementView {
		return this.view_;
	}
}
