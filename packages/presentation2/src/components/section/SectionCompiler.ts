import { Section } from "./Section";
import { SectionBuilder } from "./SectionBuilder";

import { Presentation } from "../presentation/Presentation";
import { PresentationCompiler } from "../presentation/PresentationCompiler";

import { ElementCompiler } from "../element/ElementCompiler";

import { Module } from "@rippledoc/expressions";

export class SectionCompiler {
  // Structural relationships
  //
  private builder_: SectionBuilder;
  private presentationCompiler_: PresentationCompiler;
  private elements_: ElementCompiler[];

  // Owned properties
  //
  private module_: Module;

  constructor(options: {
    sectionBuilder: SectionBuilder;
    presentationCompiler: PresentationCompiler;
  }) {
    this.builder_ = options.sectionBuilder;
    this.presentationCompiler_ = options.presentationCompiler;
    this.module_ = this.presentationCompiler_.module.addSubModule();

    this.elements_ = options.sectionBuilder.elements.map(
      (elementBuilder) =>
        new ElementCompiler({
          elementBuilder,
          sectionCompiler: this,
        }),
    );
  }

  // ----------------------------------------------------------------------------------------------
  // Property accessors
  // ----------------------------------------------------------------------------------------------

  get module(): Module {
    return this.module_;
  }

  setNextSection(nextSection: SectionCompiler) {
    this.module.mapModule("nextSection", nextSection.module);
  }

  setPreviousSection(previousSection: SectionCompiler) {
    this.module.mapModule("prevSection", previousSection.module);
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
    this.elements_.forEach((element) => element.beforeCompile());
  }

  private validateAndDerive() { }

  // ----------------------------------------------------------------------------------------------
  // Compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.compile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  compile(presentation: Presentation): Section {
    const s = Section.create({ presentation });

    s.phase2Constructor.setElements(
      this.elements_.map((ec: ElementCompiler) => {
        return ec.compile(s.section);
      }),
    );

    s.phase2Constructor.complete();

    return s.section;
  }
}
