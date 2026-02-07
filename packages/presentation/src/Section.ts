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

	private elementsInternal: Element[];

	private readonly sectionTopExpr: Expression;
	private readonly sectionHeightExpr: Expression;
	private readonly sectionBottomExpr: Expression;

	private readonly parentInternal: Presentation | null;
	private readonly viewInternal: SectionView;

	/**
	 * @param options.parent Parent presentation.
	 * @param options.sectionTop Top position expression.
	 * @param options.sectionHeight Height expression.
	 * @param options.sectionBottom Bottom position expression.
	 * @param options.elements Array of elements.
	 * @param options.viewFactory Factory for creating views.
	 * @internal Use SectionBuilder instead.
	 */
	constructor(options: {
		parent?: Presentation | null;
		sectionTop: Expression;
		sectionHeight: Expression;
		sectionBottom: Expression;
		elements?: Element[];
		viewFactory: ViewFactory;
	}) {
		const {
			parent = null,
			sectionTop,
			sectionHeight,
			sectionBottom,
			elements = [],
			viewFactory,
		} = options;

		this.parentInternal = parent;
		this.sectionTopExpr = sectionTop;
		this.sectionHeightExpr = sectionHeight;
		this.sectionBottomExpr = sectionBottom;
		this.elementsInternal = elements;
		this.viewInternal = viewFactory.createSectionView(this);
	}

	realiseView(): void {
		this.viewInternal.realise();
		this.elementsInternal.forEach((element) => element.realiseView());
	}

	layoutView(): void {
		this.viewInternal.layout();
		this.elementsInternal.forEach((element) => element.layoutView());
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
		this.elementsInternal = elements;
	}

	// --------------------
	// Geometry (values)
	// --------------------

	/**
	 * Get the top position value (evaluates the sectionTop expression).
	 * @returns The section top position in pixels.
	 */
	get sectionTop(): number {
		return this.sectionTopExpr.evaluate();
	}

	/**
	 * Get the height value (evaluates the sectionHeight expression).
	 * @returns The section height in pixels.
	 */
	get sectionHeight(): number {
		return this.sectionHeightExpr.evaluate();
	}

	/**
	 * Get the bottom position value (evaluates the sectionBottom expression).
	 * @returns The section bottom position in pixels.
	 */
	get sectionBottom(): number {
		return this.sectionBottomExpr.evaluate();
	}

	// --------------------

	/**
	 * Get all elements in this section.
	 * @returns Array copy of elements.
	 */
	get elements(): readonly Element[] {
		return this.elementsInternal.slice();
	}

	/**
	 * Get the parent presentation of this section.
	 * @returns The parent presentation.
	 */
	get parent(): Presentation | null {
		return this.parentInternal;
	}

	/**
	 * Get the view associated with this section.
	 * @returns The section's view object.
	 */
	get view(): SectionView {
		return this.viewInternal;
	}
}
