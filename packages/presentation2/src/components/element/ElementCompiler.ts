import { Element } from "./Element";
import { ElementBuilder } from "./ElementBuilder";

import { Section } from "../section/Section";
import { SectionCompiler } from "../section/SectionCompiler";

import { Module, Expression } from "@rippledoc/expressions";

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

  constructor(options: {
    elementBuilder: ElementBuilder;
    sectionCompiler: SectionCompiler;
  }) {
    this.builder_ = options.elementBuilder;
    this.sectionCompiler_ = options.sectionCompiler;

    this.module_ = this.sectionCompiler_.module.addSubModule();
  }

  // ----------------------------------------------------------------------------------------------
  // Property accessors
  // ----------------------------------------------------------------------------------------------

  get module(): Module {
    return this.module_;
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
  }

  private validateAndDerive() {
    const xAxisStrings = this.builder_.xAxis.deriveExpressions();
    this.left_ = this.module.addExpression("left", xAxisStrings.left);
    this.width_ = this.module.addExpression("width", xAxisStrings.width);
    this.right_ = this.module.addExpression("right", xAxisStrings.right);

    const yAxisStrings = this.builder_.yAxis.deriveExpressions();
    this.top_ = this.module.addExpression("top", yAxisStrings.top);
    this.height_ = this.module.addExpression("height", yAxisStrings.height);
    this.bottom_ = this.module.addExpression("bottom", yAxisStrings.bottom);
  }

  // ----------------------------------------------------------------------------------------------
  // Compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.compile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  compile(section: Section): Element {
    return new Element({
      section,
      name: this.builder_.name,
      contentDependentDimension: this.builder_.contentDependentDimension,
      left: this.left_!(),
      width: this.width_!(),
      right: this.right_!(),
      top: this.top_!(),
      height: this.height_!(),
      bottom: this.bottom_!(),
    });
  }
}
