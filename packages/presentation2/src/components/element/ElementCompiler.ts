import {
  ContentDependentDimension,
  Element,
  ElementOptions,
  ElementPhase2Constructor,
} from "./Element";
import { ElementBuilder } from "./ElementBuilder";

import { Section } from "../section/Section";
import { SectionCompiler } from "../section/SectionCompiler";

import { containsIsolatedToken } from "../common/StringBoundaryHelper";

import { Module, Expression } from "@rippledoc/expressions";
import { ScrollTriggerCompiler } from "../scrollTrigger/ScrollTriggerCompiler";
import { PinCompiler } from "../animation/pin/PinCompiler";
import { AnimationCompiler } from "../animation/keyFrameAnimation/AnimationCompiler";

export class ElementCompiler {
  // Structural relationships
  //
  private builder_: ElementBuilder;
  private sectionCompiler_: SectionCompiler;

  // Owned properties
  //
  private module_: Module;

  private left_: (() => Expression) | null = null;
  private right_: (() => Expression) | null = null;
  private width_: (() => Expression) | null = null;

  private top_: (() => Expression) | null = null;
  private bottom_: (() => Expression) | null = null;
  private height_: (() => Expression) | null = null;

  private contentDependentDimension_: ContentDependentDimension =
    ContentDependentDimension.None;
  private contentDependentDimensionHolder_ = { value: 42 };

  private scrollTriggers_: ScrollTriggerCompiler[] = [];
  private pins_: PinCompiler[] = [];
  private animations_: AnimationCompiler[] = [];

  constructor(options: {
    elementBuilder: ElementBuilder;
    sectionCompiler: SectionCompiler;
  }) {
    this.builder_ = options.elementBuilder;
    this.sectionCompiler_ = options.sectionCompiler;

    this.module_ = this.sectionCompiler_.module.addSubModule();

    this.scrollTriggers_ = this.builder_.scrollTriggers.map(
      (scrollTriggerBuilder) =>
        new ScrollTriggerCompiler({
          scrollTriggerBuilder,
          elementCompiler: this,
        }),
    );

    this.pins_ = this.builder_.pins.map(
      (pinBuilder) =>
        new PinCompiler({
          pinBuilder,
          elementCompiler: this,
        }),
    );

    this.animations_ = this.builder_.animations.map(
      (animationBuilder) =>
        new AnimationCompiler({
          animationBuilder,
          elementCompiler: this,
        }),
    );
  }

  // ----------------------------------------------------------------------------------------------
  // Property accessors
  // ----------------------------------------------------------------------------------------------

  get module(): Module {
    return this.module_;
  }

  get builder(): ElementBuilder {
    return this.builder_;
  }

  // ----------------------------------------------------------------------------------------------
  // Pre-compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.beforeCompile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  beforeCompile() {
    this.validateAndDerive();

    this.scrollTriggers_.forEach((scrollTrigger) =>
      scrollTrigger.beforeCompile(),
    );
    this.pins_.forEach((pin) => pin.beforeCompile());
    this.animations_.forEach((animation) => animation.beforeCompile());

    this.subclassValidateAndDerive();
  }

  protected subclassValidateAndDerive() {}

  private validateAndDerive() {
    const xAxisStrings = this.builder_.xAxis.deriveExpressions();
    this.left_ = this.module.addExpression("left", xAxisStrings.left);
    this.width_ = this.module.addExpression("width", xAxisStrings.width);
    this.right_ = this.module.addExpression("right", xAxisStrings.right);

    const yAxisStrings = this.builder_.yAxis.deriveExpressions();
    this.top_ = this.module.addExpression("top", yAxisStrings.top);
    this.height_ = this.module.addExpression("height", yAxisStrings.height);
    this.bottom_ = this.module.addExpression("bottom", yAxisStrings.bottom);

    this.module.addNativeExpression(
      "content",
      () => this.contentDependentDimensionHolder_.value,
    );

    if (containsIsolatedToken(xAxisStrings.width, "content")) {
      this.contentDependentDimension_ = ContentDependentDimension.Width;
    }

    if (containsIsolatedToken(yAxisStrings.height, "content")) {
      if (this.contentDependentDimension_ === ContentDependentDimension.Width) {
        throw new Error(
          "We do not support both dimensions being content-dependent",
        );
      }

      this.contentDependentDimension_ = ContentDependentDimension.Height;
    }
  }

  // ----------------------------------------------------------------------------------------------
  // Compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.compile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  compile(section: Section): Element {
    const { element, phase2Constructor } = Element.createElement(
      this.buildElementOptions(section),
    );

    this.defaultPhase2Construction(element, phase2Constructor);

    return element;
  }

  protected buildElementOptions(section: Section): ElementOptions {
    return {
      section,
      name: this.builder_.name,
      contentDependentDimension: this.contentDependentDimension_,
      left: this.left_!(),
      width: this.width_!(),
      right: this.right_!(),
      top: this.top_!(),
      height: this.height_!(),
      bottom: this.bottom_!(),
    };
  }

  protected defaultPhase2Construction(
    element: Element,
    p2c: ElementPhase2Constructor,
  ) {
    // If we have a content-dependent dimension we must report this to the underlying
    // PresentationCompiler
    //
    if (this.contentDependentDimension_ === ContentDependentDimension.Width) {
      this.sectionCompiler_.presentationCompiler.declareContentDependentElement(
        element,
        this.width_!(),
        this.contentDependentDimensionHolder_,
      );
    } else if (
      this.contentDependentDimension_ === ContentDependentDimension.Height
    ) {
      this.sectionCompiler_.presentationCompiler.declareContentDependentElement(
        element,
        this.height_!(),
        this.contentDependentDimensionHolder_,
      );
    }

    // Compile & attach scroll triggers, pins, and animations
    //

    p2c.setScrollTriggers(
      this.scrollTriggers_.map((st) => st.compile(element)),
    );

    p2c.setPins(this.pins_.map((pin) => pin.compile(element)));

    p2c.setAnimations(
      this.animations_.map((animation) => animation.compile(element)),
    );

    p2c.complete();
  }
}
