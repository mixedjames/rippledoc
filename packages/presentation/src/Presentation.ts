import type { Section } from "./Section";
import type { PresentationView } from "./view/PresentationView";
import type { ViewFactory } from "./view/ViewFactory";

export class PresentationGeometry {
  private basis_: {
    width: number;
    height: number;
  } = { width: 640, height: 480 };

  private viewport_: {
    width: number;
    height: number;
  } = { width: 640, height: 480 };

  private scale_: number = 1;

  private tx_: number = 0;

  constructor(options?: {
    basisWidth?: number;
    basisHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
  }) {
    if (!options) {
      return;
    }

    const hasBasisWidth = options.basisWidth !== undefined;
    const hasBasisHeight = options.basisHeight !== undefined;
    if (hasBasisWidth || hasBasisHeight) {
      if (!hasBasisWidth || !hasBasisHeight) {
        throw new Error(
          "PresentationGeometry: basisWidth and basisHeight must be provided together when specifying basis dimensions.",
        );
      }
      this.setBasisDimensions(options.basisWidth!, options.basisHeight!);
    }

    const hasViewportWidth = options.viewportWidth !== undefined;
    const hasViewportHeight = options.viewportHeight !== undefined;
    if (hasViewportWidth || hasViewportHeight) {
      if (!hasViewportWidth || !hasViewportHeight) {
        throw new Error(
          "PresentationGeometry: viewportWidth and viewportHeight must be provided together when specifying viewport dimensions.",
        );
      }
      this.setViewportDimensions(
        options.viewportWidth!,
        options.viewportHeight!,
      );
    }
  }

  clone(): PresentationGeometry {
    const clone = new PresentationGeometry({
      basisWidth: this.basis_.width,
      basisHeight: this.basis_.height,
    });

    if (this.viewport_.width > 0 && this.viewport_.height > 0) {
      clone.setViewportDimensions(this.viewport_.width, this.viewport_.height);
    }

    return clone;
  }

  /**
   * Basis dimensions for the presentation slides. These are the "natural" width and height of the
   * slides before any scaling is applied. They can be set to any values, and the presentation will
   * scale to fit the viewport while maintaining the aspect ratio defined by these basis dimensions.
   *
   * For example, if you set basis.width = 800 and basis.height = 600, the presentation will have a
   * natural aspect ratio of 4:3. If the viewport is resized to a different aspect ratio, the
   * presentation will scale up or down to fit while preserving that 4:3 ratio.
   *
   * The default values are width: 640 and height: 480, chosen for no better reason than nostalgia.
   */
  get basis(): { width: number; height: number } {
    return { ...this.basis_ };
  }

  /**
   * The viewport dimensions represent the actual size of the area in which the presentation is
   * rendered. This is typically determined by the size of the container element in the DOM and can
   * change dynamically (e.g., when the browser window is resized).
   */
  get viewport(): { width: number; height: number } {
    return { ...this.viewport_ };
  }

  /**
   * The scale factor applied to the presentation slides.
   *
   * Scaling presentation basis coordinates by this value yeilds the largest rectangle that fits
   * within the viewport while maintaining the aspect ratio defined by the basis dimensions.
   */
  get scale(): number {
    return this.scale_;
  }

  /**
   * The translation offset applied to the presentation slides to ensure that the presentation is
   * centered within the viewport after scaling.
   */
  get tx(): number {
    return this.tx_;
  }

  setBasisDimensions(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error(
        `Invalid basis dimensions: width and height must be positive. Received width=${width}, height=${height}`,
      );
    }
    this.basis_.width = width;
    this.basis_.height = height;
  }

  setViewportDimensions(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error(
        `Invalid viewport dimensions: width and height must be positive. Received width=${width}, height=${height}`,
      );
    }

    this.viewport_.width = width;
    this.viewport_.height = height;

    // Recalculate scale and translation to maintain aspect ratio and center the presentation
    const scaleX = width / this.basis_.width;
    const scaleY = height / this.basis_.height;
    this.scale_ = Math.min(scaleX, scaleY);

    const scaledWidth = this.basis_.width * this.scale_;
    this.tx_ = (width - scaledWidth) / 2; // Center horizontally
  }

  mapBasisToViewport(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.scale_ + this.tx_,
      y: y * this.scale_, // No vertical translation needed since we top-align the presentation
    };
  }
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
  private sections_: Section[];
  private readonly view_: PresentationView;

  private geometry_: PresentationGeometry;

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

    this.sections_ = sections;
    this.view_ = viewFactory.createPresentationView(this);
    this.geometry_ = geometry;
  }

  /**
   * Realise the entire view tree for this presentation.
   *
   * This will:
   * - Call {@link PresentationView.realise} on the root view, which is typically backed by a
   *   document fragment or container element provided by the caller, and
   * - Cascade realise notifications to all child sections (and, transitively, their elements).
   *
   * Callers must invoke this exactly once before {@link layoutView}. Implementations of
   * {@code SectionView.realise} and {@code ElementView.realise} may assume that their parent
   * views have already been realised by the time they are called.
   */
  realiseView(): void {
    this.view_.realise();
    this.sections_.forEach((section) => section.realiseView());
  }

  /**
   * Lay out the already-realised view tree using the current geometry.
   *
   * This assumes {@link realiseView} has already been called. View implementations are allowed
   * to throw if {@code layout()} is invoked on an unrealised view. Layout propagates from the
   * root presentation view down through all sections and their elements.
   */
  layoutView(): void {
    this.view_.layout();
    this.sections_.forEach((section) => section.layoutView());
  }

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
   * Get the view associated with this presentation.
   * @returns The presentation's view object.
   */
  get view(): PresentationView {
    return this.view_;
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
