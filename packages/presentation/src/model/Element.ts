import type { Expression } from "@rippledoc/expressions";

import type { Section } from "./Section";
import type { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { ScrollTriggerInternal } from "../scrollTrigger/ScrollTriggerInternal";
import { Style } from "./Styles";

import type { ElementView } from "../view/ElementView";
import type { ViewFactory } from "../view/ViewFactory";

import { ElementTransform } from "../animation/ElementTransform";

/**
 * Content-dependent dimension types for element layout.
 */
export enum ContentDependentDimension {
  None = "none",
  Width = "width",
  Height = "height",
}

/**
 * Immutable element node in a Section.
 *
 * An Element captures:
 * - Layout intent via Expressions (left/right/width, top/bottom/height)
 * - Base visual design via an immutable Style snapshot
 * - Optional runtime transform state via ElementTransform
 *
 * The core layout and base style do not change after construction. Any
 * animation or interactive behaviour should be modelled through
 * {@link ElementTransform} or view-specific state, not by mutating the
 * Element instance itself.
 *
 * **DO NOT construct directly.** Use ElementBuilder instead.
 */
export class Element {
  private readonly name_: string;

  private readonly left_: Expression;
  private readonly right_: Expression;
  private readonly width_: Expression;
  private readonly top_: Expression;
  private readonly bottom_: Expression;
  private readonly height_: Expression;
  private readonly contentDependentDimension_: ContentDependentDimension;

  private readonly style_: Style = new Style();
  private readonly scrollTriggerInternals_: ScrollTriggerInternal[];

  private readonly parent_: Section;
  private readonly view_: ElementView;

  private transform_: ElementTransform | null = null;
  private animated_ = false;

  /**
   * @param options.name Element name.
   * @param options.left Left position expression.
   * @param options.right Right position expression.
   * @param options.width Width expression.
   * @param options.top Top position expression.
   * @param options.bottom Bottom position expression.
   * @param options.height Height expression.
   * @param options.scrollTriggers Scroll triggers associated with this element.
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
    contentDependentDimension: ContentDependentDimension;
    /**
     * Optional hook for swapping the underlying implementation of the
     * content-dependent expression (width or height) after compilation.
     *
     * This must be provided whenever {@link contentDependentDimension}
     * is not {@link ContentDependentDimension.None}.
     */
    replaceNativeFunction?: (fn: () => number) => void;
    style?: Style;
    scrollTriggers?: ScrollTrigger[];
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
      style,
      scrollTriggers = [],
    } = options;

    // (1) Store the simple properties that require no transformation or validation
    this.parent_ = parent;
    this.name_ = name;

    this.left_ = left;
    this.right_ = right;
    this.width_ = width;
    this.top_ = top;
    this.bottom_ = bottom;
    this.height_ = height;

    this.contentDependentDimension_ = options.contentDependentDimension;

    if (style) {
      this.style_ = style.clone();
    }

    // (2) ScrollTriggers: these exist as ScrollTriggerInternal instances under the hood,
    //     but we expose them as simple ScrollTrigger objects in the public API.
    this.scrollTriggerInternals_ = scrollTriggers.map(
      (trigger) => new ScrollTriggerInternal(trigger),
    );

    // (3) Create the view and register scroll triggers with it.
    this.view_ = this.createView(viewFactory);
    this.view_.registerScrollTriggers(this.scrollTriggerInternals_);

    // (4) If this element has a content-dependent dimension, we must
    // delegate the underlying expression implementation to the view.
    if (this.contentDependentDimension_ !== ContentDependentDimension.None) {
      if (!options.replaceNativeFunction) {
        throw new Error(
          "Element: replaceNativeFunction is required when contentDependentDimension is not None",
        );
      }

      options.replaceNativeFunction(() =>
        this.view_.getContentDependentDimension(
          this.contentDependentDimension_,
        ),
      );

      // Notify the Presentation that this is a content-dependent element
      this.parent_.parent._declareContentDependentElement(
        this,
        this.contentDependentDimension_ == ContentDependentDimension.Width
          ? this.width_
          : this.height_,
      );
    }
  }

  /**
   * Create the view for this element using the provided view factory.
   *
   * This is a key extension point for custom element types with bespoke view
   * implementations.
   *
   * @param viewFactory Factory for creating views.
   * @returns The created element view.
   */
  protected createView(viewFactory: ViewFactory): ElementView {
    return viewFactory.createElementView(this);
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
   * Get the content-dependent dimension type for this element.
   * @returns The content-dependent dimension type.
   */
  get contentDependentDimension(): ContentDependentDimension {
    return this.contentDependentDimension_;
  }

  /**
   * Get the base style for this element.
   *
   * Returns a cloned snapshot. Mutating the returned Style does **not**
   * affect the underlying Element; use ElementTransform or view-level
   * mechanisms for runtime visual changes.
   */
  get style(): Style {
    return this.style_.clone();
  }

  /**
   * Indicates whether this element has runtime transform state attached.
   *
   * When set to true, a lazily-initialised ElementTransform instance is
   * created and can be accessed via the transform getter.
   */
  get animated(): boolean {
    return this.animated_;
  }

  set animated(value: boolean) {
    if (value && !this.animated_) {
      if (!this.transform_) {
        this.transform_ = new ElementTransform(this);
      }
    }
    this.animated_ = value;
  }

  /**
   * Runtime transform state for this element, if animation has been
   * explicitly enabled via the animated flag.
   */
  get transform(): ElementTransform {
    if (!this.animated_) {
      throw new Error(
        "Element.transform accessed but animated is false. Set animated to true to enable transforms.",
      );
    }

    // Safe use if '!' because transform_ is guaranteed to be non-null when animated_ is true.
    return this.transform_!;
  }

  /**
   * Get the scroll triggers associated with this element.
   * @returns A copy of the scroll trigger descriptors array.
   */
  get scrollTriggers(): readonly ScrollTrigger[] {
    return this.scrollTriggerInternals_.map(
      (internal) => internal.scrollTrigger,
    );
  }

  /**
   * Look up a scroll trigger on this element by its optional name.
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
