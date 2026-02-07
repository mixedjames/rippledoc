import type { Expression } from "@expressions";
import type { Section } from "./Section";
import type { PresentationView } from "./view/PresentationView";
import type { ViewFactory } from "./view/ViewFactory";

/**
 * Represents an immutable presentation containing sections and slide dimensions.
 *
 * **DO NOT construct directly.** Use PresentationBuilder or presentationFromXML() instead:
 * - {@link PresentationBuilder} for programmatic construction
 * - {@link presentationFromXML} for loading from XML files
 *
 * @example
 * // Correct usage with PresentationBuilder
 * const builder = new PresentationBuilder({ viewFactory });
 * builder.setSlideWidth("800");
 * builder.setSlideHeight("600");
 * const section = builder.createSection();
 * const presentation = builder.build();
 *
 * @example
 * // Correct usage with XML
 * const presentation = await presentationFromXML("./file.xml", viewFactory);
 */
export class Presentation {

	private sectionsInternal: Section[];
	private readonly slideWidthExpr: Expression;
	private readonly slideHeightExpr: Expression;
	private readonly viewInternal: PresentationView;

	/**
	 * @param options.sections Array of sections.
	 * @param options.slideWidth Width expression.
	 * @param options.slideHeight Height expression.
	 * @param options.viewFactory Factory for creating views.
	 * @internal Use PresentationBuilder or presentationFromXML() instead.
	 */
	constructor(options: {
		sections?: Section[];
		slideWidth: Expression;
		slideHeight: Expression;
		viewFactory: ViewFactory;
	}) {
		const { sections = [], slideWidth, slideHeight, viewFactory } = options;

		this.sectionsInternal = sections;
		this.slideWidthExpr = slideWidth;
		this.slideHeightExpr = slideHeight;
		this.viewInternal = viewFactory.createPresentationView(this);
	}

	realiseView(): void {
		this.viewInternal.realise();
		this.sectionsInternal.forEach((section) => section.realiseView());
	}

	layoutView(): void {
		this.viewInternal.layout();
		this.sectionsInternal.forEach((section) => section.layoutView());
	}

	/**
	 * INTERNAL IMPLEMENTATION DETAIL - NOT PART OF PUBLIC API.
	 *
	 * This method exists solely to support the PresentationBuilder construction pattern
	 * where the Presentation must be created before its child Sections. Do not call
	 * this method directly or rely on its existence.
	 *
	 * Bootstrapping systems is hard :(
	 *
	 * @internal
	 * @param sections Built sections to attach to this presentation.
	 */
	_setSections(sections: Section[]): void {
		this.sectionsInternal = sections;
	}

	/**
	 * Get all sections in this presentation.
	 * @returns Array of sections.
	 */
	get sections(): readonly Section[] {
		return this.sectionsInternal;
	}

	/**
	 * Get the slide width value (evaluates the width expression).
	 * @returns The slide width in pixels.
	 */
	get slideWidth(): number {
		return this.slideWidthExpr.evaluate();
	}

	/**
	 * Get the slide height value (evaluates the height expression).
	 * @returns The slide height in pixels.
	 */
	get slideHeight(): number {
		return this.slideHeightExpr.evaluate();
	}

	/**
	 * Get the view associated with this presentation.
	 * @returns The presentation's view object.
	 */
	get view(): PresentationView {
		return this.viewInternal;
	}
}
