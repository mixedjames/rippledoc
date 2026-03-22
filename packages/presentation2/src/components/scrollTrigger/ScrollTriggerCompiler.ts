import { Element } from "../element/Element";
import { ElementCompiler } from "../element/ElementCompiler";

import { Section } from "../section/Section";
import { SectionCompiler } from "../section/SectionCompiler";

import { ScrollTrigger, DefaultScrollTrigger } from "./ScrollTrigger";
import { ScrollTriggerBuilder } from "./ScrollTriggerBuilder";

import { Module, Expression } from "@rippledoc/expressions";

export class ScrollTriggerCompiler {
  private builder_: ScrollTriggerBuilder;
  private parentCompiler_: ElementCompiler | SectionCompiler;

  private module_: Module;

  private start_: (() => Expression) | null = null;
  private end_: (() => Expression) | null = null;

  constructor(options: {
    scrollTriggerBuilder: ScrollTriggerBuilder;
    elementCompiler?: ElementCompiler;
    sectionCompiler?: SectionCompiler;
  }) {
    this.builder_ = options.scrollTriggerBuilder;

    if (options.elementCompiler && options.sectionCompiler === undefined) {
      this.parentCompiler_ = options.elementCompiler;
    } else if (
      options.sectionCompiler &&
      options.elementCompiler === undefined
    ) {
      this.parentCompiler_ = options.sectionCompiler;
    } else {
      throw new Error(
        "ScrollTriggerCompiler must have either an element compiler or a section compiler as parent, but not both",
      );
    }

    this.module_ = this.parentCompiler_.module.addSubModule();
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
    this.start_ = this.module.addExpression("start", this.builder_.start);
    this.end_ = this.module.addExpression("end", this.builder_.end);
  }

  // ----------------------------------------------------------------------------------------------
  // Compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.compile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  compile(parent: Section | Element): ScrollTrigger {
    return new DefaultScrollTrigger({
      parent,
      name: this.builder_.name,
      start: this.start_!(),
      end: this.end_!(),
    });
  }
}
