import type { Section } from "./Section";
import type { PresentationDisplay } from "./PresentationDisplay";
import type { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { PresentationGeometry } from "./PresentationGeometry";

import type { PresentationView } from "../view/PresentationView";
import type { ViewFactory } from "../view/ViewFactory";

/**
 * Represents an immutable presentation containing sections and slide geometry.
 *
 * Slide size and scaling are stored in a {@link PresentationGeometry} instance,
 * which is owned by the Presentation and typically configured via the
 * {@link PresentationBuilder} in the `@rippledoc/presentationBuilder` package.
 *
 * **DO NOT construct directly.** Use the builder/XML helpers instead:
 * - {@link PresentationBuilder} (in `@rippledoc/presentationBuilder`) for
 *   programmatic construction
 * - {@link presentationFromXML} (in `@rippledoc/presentationBuilder`) for
 *   loading from XML files
 *
 * @example
 * // Correct usage with PresentationBuilder (from @rippledoc/presentationBuilder)
 * const builder = new PresentationBuilder({ viewFactory });
 * builder.setSlideWidth(800);
 * builder.setSlideHeight(600);
 * const section = builder.createSection();
 * const presentation = builder.build();
 *
 * @example
 * // Correct usage with XML (from @rippledoc/presentationBuilder)
 * const presentation = await presentationFromXML("./file.xml", viewFactory);
 */
export class Presentation {
  private sections_: Section[] = [];
  private readonly view_: PresentationView;

  private readonly display_: PresentationDisplay;

  private geometry_: PresentationGeometry;

  /**
   * @param options.geometry Shared geometry state for this presentation.
   * @param options.viewFactory Factory for creating views.
   * @internal Use the PresentationBuilder / presentationFromXML helpers instead.
   */
  constructor(options: {
    viewFactory: ViewFactory;
    geometry: PresentationGeometry;
  }) {
    const { viewFactory, geometry } = options;

    if (!geometry) {
      throw new Error("Presentation constructor: geometry is required");
    }

    this.view_ = viewFactory.createPresentationView(this);
    this.geometry_ = geometry;
    this.display_ = this.createDisplay();
  }

  private createDisplay(): PresentationDisplay {
    return {
      realise: (): void => {
        this.view_.realise();
        this.sections_.forEach((section) => {
          const sectionView = section.view;
          sectionView.realise();

          section.elements.forEach((element) => {
            element.view.realise();
          });
        });
      },

      layout: (): void => {
        this.view_.layout();
        this.sections_.forEach((section) => {
          const sectionView = section.view;
          sectionView.layout();

          section.elements.forEach((element) => {
            element.view.layout();
          });
        });
      },

      setTriggerMarkerVisibility: (visible: boolean): void => {
        this.view_.setTriggerMarkerVisibility(visible);
      },
    };
  } // end createDisplay()

  setViewportDimensions(width: number, height: number): void {
    this.geometry_.setViewportDimensions(width, height);
  }

  /**
   * Get all sections in this presentation.
   * @returns Array of sections.
   */
  get sections(): readonly Section[] {
    return this.sections_;
  }

  /**
   * Get the slide width value (evaluates the width expression).
   * @returns The slide width in pixels.
   */
  get slideWidth(): number {
    return this.geometry_.basis.width;
  }

  /**
   * Get the slide height value (evaluates the height expression).
   * @returns The slide height in pixels.
   */
  get slideHeight(): number {
    return this.geometry_.basis.height;
  }

  /**
   * Get all scroll triggers defined on this presentation's sections and elements.
   * @returns A flat array of ScrollTrigger instances.
   */
  get scrollTriggers(): readonly ScrollTrigger[] {
    return this.sections_.flatMap((section) => [
      ...section.scrollTriggers,
      ...section.elements.flatMap((element) => [...element.scrollTriggers]),
    ]);
  }

  /**
   * Get the view associated with this presentation.
   * @returns The presentation's view object.
   */
  get view(): PresentationView {
    return this.view_;
  }

  /**
   * Facade for controlling how this presentation is displayed.
   *
   * This provides a stable, renderer-agnostic surface over the
   * internal view hierarchy constructed via {@link ViewFactory}.
   */
  get display(): PresentationDisplay {
    return this.display_;
  }

  get geometry(): PresentationGeometry {
    return this.geometry_.clone();
  }

  // -----------------------------------------------------------------------------------------------
  // INTERNAL METHODS - NOT PART OF PUBLIC API
  // -----------------------------------------------------------------------------------------------

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
    this.sections_ = sections;
  }
}
