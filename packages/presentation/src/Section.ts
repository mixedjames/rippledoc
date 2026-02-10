import type { Expression } from "@expressions";
import type { Presentation } from "./Presentation";
import type { Element } from "./Element";
import type { SectionView } from "./view/SectionView";
import type { ViewFactory } from "./view/ViewFactory";

/**
 * Represents an immutable section containing elements and layout properties.
 *
 * **DO NOT construct directly.** Use SectionBuilder instead:
 * - {@link SectionBuilder} for programmatic construction
 *
 * Sections are created through DocumentBuilder:
 * @example
 * // Correct usage
 * const documentBuilder = new DocumentBuilder({ viewFactory });
 * const section = documentBuilder.createSection();
 * section.setHeight("200");
 * const element = section.createElement();
 * // ... then build the document
 */
export class Section {

	private readonly name_: string;

	private elements_: Element[];

	private readonly sectionTop_: Expression;
	private readonly sectionHeight_: Expression;
	private readonly sectionBottom_: Expression;

	private readonly parent_: Presentation;
	private readonly view_: SectionView;

	/**
	 * @param options.name Section name.
	 * @param options.parent Parent presentation.
	 * @param options.sectionTop Top position expression.
	 * @param options.sectionHeight Height expression.
	 * @param options.sectionBottom Bottom position expression.
	 * @param options.elements Array of elements.
	 * @param options.viewFactory Factory for creating views.
	 * @internal Use SectionBuilder instead.
	 */
	constructor(options: {
		name: string;
		parent: Presentation;
		sectionTop: Expression;
		sectionHeight: Expression;
		sectionBottom: Expression;
		elements?: Element[];
		viewFactory: ViewFactory;
	}) {
		const {
			name,
			parent,
			sectionTop,
			sectionHeight,
			sectionBottom,
			elements = [],
			viewFactory,
		} = options;

		if (typeof name !== "string") {
			throw new Error("Section: name must be a string");
		}

		this.name_ = name;
		this.parent_ = parent;
		this.sectionTop_ = sectionTop;
		this.sectionHeight_ = sectionHeight;
		this.sectionBottom_ = sectionBottom;
		this.elements_ = elements;
		this.view_ = viewFactory.createSectionView(this);
	}

	realiseView(): void {
		this.view_.realise();
		this.elements_.forEach((element) => element.realiseView());
	}

	layoutView(): void {
		this.view_.layout();
		this.elements_.forEach((element) => element.layoutView());
	}

	/**
	 * INTERNAL IMPLEMENTATION DETAIL - NOT PART OF PUBLIC API.
	 *
	 * This method exists solely to support the SectionBuilder construction pattern
	 * where the Section must be created before its child Elements. Do not call
	 * this method directly or rely on its existence.
	 *
	 * @internal
	 * @param elements Built elements to attach to this section.
	 */
	_setElements(elements: Element[]): void {
		this.elements_ = elements;
	}

	// --------------------
	// Geometry (values)
	// --------------------

	/**
	 * Get the section name.
	 * @returns The section name.
	 */
	get name(): string {
		return this.name_;
	}

	/**
	 * Get the top position value (evaluates the sectionTop expression).
	 * @returns The section top position in pixels.
	 */
	get sectionTop(): number {
		return this.sectionTop_.evaluate();
	}

	/**
	 * Get the height value (evaluates the sectionHeight expression).
	 * @returns The section height in pixels.
	 */
	get sectionHeight(): number {
		return this.sectionHeight_.evaluate();
	}

	/**
	 * Get the bottom position value (evaluates the sectionBottom expression).
	 * @returns The section bottom position in pixels.
	 */
	get sectionBottom(): number {
		return this.sectionBottom_.evaluate();
	}

	// --------------------

	/**
	 * Get all elements in this section.
	 * @returns Array copy of elements.
	 */
	get elements(): readonly Element[] {
		return this.elements_.slice();
	}

	/**
	 * Get the parent presentation of this section.
	 * @returns The parent presentation.
	 */
	get parent(): Presentation {
		return this.parent_;
	}

	/**
	 * Get the view associated with this section.
	 * @returns The section's view object.
	 */
	get view(): SectionView {
		return this.view_;
	}
}
