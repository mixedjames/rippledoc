import { Section } from "../section/Section";
import { Element } from "../element/Element";
import { PresentationView } from "./PresentationView";

export type ContentDependentElement = {
  element: Element;
  valueHolder: { value: number };
};

/**
 * IMPLEMENTATION DETAIL - clients must not use this interface.
 */
export interface Phase2Constructor {
  /**
   * Sets the sections of the presentation. These are in logical order (not dependency order).
   * The array is shallow-copied so callers cannot modify the presentation's sections after setting
   * them. The presentation takes ownership of the section objects themselves.
   */
  setSections(sections: Section[]): Phase2Constructor;

  /**
   * Sets the sorted list of content-dependent elements. The list is expected to be sorted in
   * dependency order, so that if element A's size depends on element B, then A comes after B in the
   * list.
   */
  setSortedContentDependentElements(
    elements: ContentDependentElement[],
  ): Phase2Constructor;

  /**
   * Marks phase 2 of construction as complete. Frees any resources used to support phase 2
   * construction, and prevents any further calls to the phase 2 constructor methods.
   */
  complete(): void;
}

type PresentationOptions = {
  basisDimensions: { width: number; height: number };
  slideHeightNativeExpression: (newFn: () => number) => void;
  stylesheet: string;
};

export interface PhysicalDimensions {
  get width(): number;

  get height(): number;

  get scale(): number;

  get tx(): number;
}

/**
 *
 * # Implementation notes
 * These are notes on the implementation of the presentation. They are not part of the public API,
 * and clients must not rely on them. They are subject to change without warning.
 *
 * ## (1) Two-phase construction
 * These is a chicken and egg problem in constructing the presentation. The sections of the
 * presentation need to reference the presentation itself, but the presentation needs to know its
 * sections. But the whole tree is immutable after construction. So what to do?
 *
 * I adopted a two-phase construction approach. The presentation is constructed in two phases:
 * - Phase 1: details of the presentation that don't depend on the rest of the tree are passed
 *   to the constructor via the create() method.
 * - Phase 2: details of the presentation that do depend on the rest of the tree are set via the
 *   Phase2Constructor interface, which is returned by the create() method.
 * - Once phase 2 is complete, the presentation is fully constructed and immutable.
 *
 * ## (2) Content-dependent elements
 *
 * Content-dependent elements are unusual. In normal layout, data flows only in one direction -
 * elements know their own geometry, and this is used by the rendering systems.
 *
 * Content-dependent elements depend on the rendering system to know their size however. In our
 * model one dimension is fixed and the rendering system determines the other dimension based on
 * that and the content.
 *
 * To faciliate this we keep a list of content-dependent elements in the presentation:
 * - The list is sort in dependency order, so that if element A's size depends on element B, then A
 *   comes after B in the list.
 * - The list also contains value holders for the content-dependent dimension of each element (in
 *   basis coorinates, not physical ones).
 *
 * The rendering system is expected to determine the content-dependent dimensions of the elements in
 * order, updating the value holders as it goes.
 *
 * See PresentationCompiler for the details of how the sorted list of content-dependent elements is
 * constructed.
 */
export class Presentation {
  // Construction-related data ---------------------------------------------------------------------
  //

  private static constructionToken_: symbol = Symbol(
    "Presentation.ConstructorProtector",
  );

  private phase2Constructor_: Phase2Constructor | null = {
    setSections: (sections: Section[]) => {
      this.sections_.push(...sections);
      return this.phase2Constructor;
    },

    setSortedContentDependentElements: (
      elements: ContentDependentElement[],
    ) => {
      this.sortedContentDependentElements_.push(...elements);
      return this.phase2Constructor;
    },

    complete: () => {
      this.phase2Constructor_ = null;
    },
  };

  // View properties -------------------------------------------------------------------------------
  //
  private view_: PresentationView | null = null;

  // Owned properties ------------------------------------------------------------------------------
  //

  private basisDimensions_: { width: number; height: number };

  private stylesheet_: string;

  private sections_: Section[] = [];

  // View-dependent properties ---------------------------------------------------------------------
  //
  // These properties are oddities in that they all exists to connect the presentation tree to the
  // underlying view. In the future I'd like to have some unified way of doing this, but for now
  // they are just properties on the presentation.

  // The list of content-dependent elements, sorted in dependency order. This is populated during
  // phase 2 of construction, and is used by the view to determine the content-dependent dimensions
  // of elements.
  private sortedContentDependentElements_: ContentDependentElement[] = [];

  // The 'slideHeight' variable is provided to expressions during compilation. Clearly it varies
  // depending on the view.
  private slideHeightNativeExpression_: (newFn: () => number) => void;

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  /**
   * Don't call the constructor directly. Use Presentation.create() instead.
   */
  constructor(token: symbol, options: PresentationOptions) {
    if (token !== Presentation.constructionToken_) {
      throw new Error(
        "Presentation is not constructable. Use Presentation.create() instead.",
      );
    }

    this.basisDimensions_ = { ...options.basisDimensions };
    this.slideHeightNativeExpression_ = options.slideHeightNativeExpression;
    this.stylesheet_ = options.stylesheet;

    this.installDefaultSlideHeightExpression();
  }

  private get phase2Constructor(): Phase2Constructor {
    if (this.phase2Constructor_ === null) {
      throw new Error("Phase 2 construction is already complete.");
    }

    return this.phase2Constructor_;
  }

  public static create(options: PresentationOptions): {
    presentation: Presentation;
    phase2Constructor: Phase2Constructor;
  } {
    const presentation = new Presentation(
      Presentation.constructionToken_,
      options,
    );
    return { presentation, phase2Constructor: presentation.phase2Constructor };
  }

  /**
   * The 'slideHeight' variable is used by expressions to determine the actual height of a slide
   * in basis coordinates. It enables them to match the actual height of the viewport.
   *
   * It is, inevitably, a view-dependent property. However, we want expressions to be evaluable
   * even when there is no view attached, so we need to have some default expression for it.
   *
   * Two functions exist as a pair:
   * - `installDefaultSlideHeightExpression`
   * - `installProperSlideHeightExpression`
   */
  private installDefaultSlideHeightExpression(): void {
    // Default 'slideHeight' is the basis height. Is this a good default? Maybe not, but until
    // the view is attached, there is no physical dimension to base it on, so this is the best we
    // can do.

    this.slideHeightNativeExpression_(() => this.basisDimensions_.height);
  }

  /**
   * See installDefaultSlideHeightExpression
   */
  private installProperSlideHeightExpression(): void {
    // Once the view is attached, 'slideHeight' should be based on the physical dimensions of the
    // view. This is the expression we install when a view is attached.

    this.slideHeightNativeExpression_(() => {
      if (this.view_ === null) {
        throw new Error("No view is attached to this presentation.");
      }

      return (
        this.view_.physicalDimensions.height /
        this.view_.physicalDimensions.scale
      );
    });
  }

  // ----------------------------------------------------------------------------------------------
  // View management
  // ----------------------------------------------------------------------------------------------

  attachView(view: PresentationView): void {
    if (this.view_ !== null) {
      throw new Error("A view is already attached to this presentation.");
    }

    this.view_ = view;
    view.connect({
      presentation: this,
      sortedContentDependentElements: this.sortedContentDependentElements_,
    });

    // After .connect is it reasonable to assume that the view sufficiently realised to provide
    // physical dimensions, so we can set the slide height expression now.
    //
    this.installProperSlideHeightExpression();
  }

  detachView(): void {
    if (this.view_ === null) {
      throw new Error("No view is attached to this presentation.");
    }

    // Clear the slide height expression, since without a view there is no physical dimension to
    // base it on.
    this.installDefaultSlideHeightExpression();

    this.view_.disconnect();
    this.view_ = null;
  }

  get hasView(): boolean {
    return this.view_ !== null;
  }

  // ----------------------------------------------------------------------------------------------
  // Owned properties
  // ----------------------------------------------------------------------------------------------

  get sections(): readonly Section[] {
    return this.sections_;
  }

  get basisDimensions(): { width: number; height: number } {
    return { ...this.basisDimensions_ };
  }

  get physicalDimensions(): PhysicalDimensions {
    if (this.view_ === null) {
      throw new Error("No view is attached to this presentation.");
    }

    return this.view_.physicalDimensions;
  }

  get height(): number {
    if (this.sections.length === 0) {
      return 0;
    }
    return this.sections[this.sections.length - 1]!.sectionBottom;
  }

  get stylesheet(): string {
    return this.stylesheet_;
  }

  // ----------------------------------------------------------------------------------------------
  // ...
  // ----------------------------------------------------------------------------------------------
}
