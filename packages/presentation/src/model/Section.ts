import type { Expression } from "@rippledoc/expressions";

import type { Presentation } from "./Presentation";
import type { Element } from "./Element";
import type { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { ScrollTriggerInternal } from "../scrollTrigger/ScrollTriggerInternal";
import { Style } from "./Styles";

import type { SectionView } from "../view/SectionView";
import type { ViewFactory } from "../view/ViewFactory";

import { SectionTransform } from "../animation/SectionTransform";

/**
 * Immutable section node in a Presentation.
 *
 * A Section represents a fixed portion of the document:
 * - Structure: parent Presentation and child Elements
 * - Layout intent: top/height/bottom expressed as Expressions
 * - Base style: an immutable Style snapshot captured at build time
 * - Runtime animation: optional SectionTransform, managed via the animated flag
 *
 * The public API never mutates the section graph or its base style. Any
 * animation or visual adjustment should be expressed via {@link SectionTransform}
 * or in the view layer.
 *
 * **DO NOT construct directly.** Use SectionBuilder instead.
 */
export class Section {
  // --------------------
  // (1) Base properties of a Section:
  //     Name, parent presentation, view instance

  private readonly name_: string;

  private readonly parent_: Presentation;
  private elements_: Element[] = [];

  private readonly view_: SectionView;

  // --------------------
  // (2) Layout properties of a Section:
  //     sectionTop, sectionHeight, sectionBottom

  private readonly sectionTop_: Expression;
  private readonly sectionHeight_: Expression;
  private readonly sectionBottom_: Expression;

  // --------------------
  // (3) Style properties of a Section

  private readonly style_: Style = new Style();

  // --------------------
  // (4) Animation properties of a Section:
  //     animated flag, transform state, scroll triggers
  private animated_ = false;
  private transform_: SectionTransform | null = null;
  private readonly scrollTriggerInternals_: ScrollTriggerInternal[];

  /**
   * @param options.name Section name.
   * @param options.parent Parent presentation.
   * @param options.sectionTop Top position expression.
   * @param options.sectionHeight Height expression.
   * @param options.sectionBottom Bottom position expression.
   * @param options.scrollTriggers Scroll triggers associated with this section.
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
    scrollTriggers?: ScrollTrigger[];
    style?: Style;
    elements?: Element[];
    viewFactory: ViewFactory;
  }) {
    const {
      name,
      parent,
      sectionTop,
      sectionHeight,
      sectionBottom,
      scrollTriggers = [],
      style,
      viewFactory,
    } = options;

    // (1) Store the simple properties that require no transformation or validation
    //
    this.parent_ = parent;
    this.name_ = name;

    this.sectionTop_ = sectionTop;
    this.sectionHeight_ = sectionHeight;
    this.sectionBottom_ = sectionBottom;

    if (style) {
      this.style_ = style.clone();
    }

    // (2) ScrollTriggers: these exist as ScrollTriggerInternal instances under the hood,
    //     but we expose them as simple ScrollTrigger objects in the public API.
    this.scrollTriggerInternals_ = scrollTriggers.map(
      (trigger) => new ScrollTriggerInternal(trigger),
    );

    // (3) Create the view for this section and register scroll triggers with it.
    this.view_ = viewFactory.createSectionView(this, this.parent.view);
    this.view_.registerScrollTriggers(this.scrollTriggerInternals_);
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
   * Get the base style for this section.
   *
   * Returns a cloned snapshot. Mutating the returned Style does **not**
   * affect the underlying Section; use runtime transforms or view-specific
   * mechanisms for animation or visual changes.
   */
  get style(): Style {
    return this.style_.clone();
  }

  /**
   * Indicates whether this section has runtime transform state attached.
   *
   * When set to true, a lazily-initialised SectionTransform instance is
   * created and can be accessed via the transform getter.
   */
  get animated(): boolean {
    return this.animated_;
  }

  set animated(value: boolean) {
    if (value && !this.animated_) {
      if (!this.transform_) {
        this.transform_ = new SectionTransform();
      }
    }
    this.animated_ = value;
  }

  /**
   * Runtime transform state for this section, if animation has been
   * explicitly enabled via the animated flag.
   */
  get transform(): SectionTransform | null {
    return this.transform_;
  }

  /**
   * Get all elements in this section.
   * @returns Array copy of elements.
   */
  get elements(): readonly Element[] {
    return this.elements_.slice();
  }

  /**
   * Get the scroll triggers associated with this section.
   * @returns A copy of the scroll trigger descriptors array.
   */
  get scrollTriggers(): readonly ScrollTrigger[] {
    return this.scrollTriggerInternals_.map(
      (internal) => internal.scrollTrigger,
    );
  }

  /**
   * Look up a scroll trigger on this section by its optional name.
   *
   * Returns the first matching trigger, or undefined if no trigger
   * with the provided name is found.
   */
  getScrollTriggerByName(
    name: string,
    onSuccess?: (trigger: ScrollTrigger) => void,
  ): ScrollTrigger | undefined {
    const trigger = this.scrollTriggers.find(
      (trigger) => trigger.name === name,
    );
    if (trigger && onSuccess) {
      onSuccess(trigger);
    }
    return trigger;
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
