import type { Expression } from "@expressions";
import type { Section } from "./Section";
import type { PresentationView } from "./view/PresentationView";
import type { ViewFactory } from "./view/ViewFactory";

export class PresentationGeometry {
    basis: { width: number; height: number } = {width: 640, height: 480};
    viewport: { width: number; height: number } = {width: 0, height: 0};
    scale: number = 1;
}

/**
 * Represents an immutable presentation containing sections and slide geometry.
 *
 * Slide size and scaling are stored in a {@link PresentationGeometry} instance,
 * which is owned by the Presentation and typically configured via
 * {@link PresentationBuilder}.
 *
 * **DO NOT construct directly.** Use PresentationBuilder or presentationFromXML() instead:
 * - {@link PresentationBuilder} for programmatic construction
 * - {@link presentationFromXML} for loading from XML files
 *
 * @example
 * // Correct usage with PresentationBuilder
 * const builder = new PresentationBuilder({ viewFactory });
 * builder.setSlideWidth(800);
 * builder.setSlideHeight(600);
 * const section = builder.createSection();
 * const presentation = builder.build();
 *
 * @example
 * // Correct usage with XML
 * const presentation = await presentationFromXML("./file.xml", viewFactory);
 */
export class Presentation {

	private sectionsInternal: Section[];
	private readonly viewInternal: PresentationView;

  private geometry: PresentationGeometry;

	/**
	 * @param options.sections Array of sections.
	 * @param options.geometry Shared geometry state for this presentation.
	 * @param options.viewFactory Factory for creating views.
	 * @internal Use PresentationBuilder or presentationFromXML() instead.
	 */
	constructor(options: {
		sections?: Section[];
		viewFactory: ViewFactory;
    geometry: PresentationGeometry;
	}) {
		const { sections = [], viewFactory, geometry } = options;

    if (!geometry) {
      throw new Error("Presentation constructor: geometry is required");
    }

		this.sectionsInternal = sections;
		this.viewInternal = viewFactory.createPresentationView(this);
    this.geometry = geometry;
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
		return this.geometry.basis.width;
	}

	/**
	 * Get the slide height value (evaluates the height expression).
	 * @returns The slide height in pixels.
	 */
	get slideHeight(): number {
		return this.geometry.basis.height;
	}

	/**
	 * Get the view associated with this presentation.
	 * @returns The presentation's view object.
	 */
	get view(): PresentationView {
		return this.viewInternal;
	}
}
