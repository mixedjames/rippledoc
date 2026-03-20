import { PresentationBuilder } from "./PresentationBuilder";
import { Presentation } from "./Presentation";
import { SectionCompiler } from "../section/SectionCompiler";

import { Module, Expression } from "@rippledoc/expressions";

/**
 *
 * # Implementation Notes:
 *
 * ## (1) Compilation process
 * The compilation process consists of the following steps:
 * 1. Pre-compilation:
 *    - Validation - especially for properties whose validity depends on the full
 *      Presentation/Section/Element structure. For example, expression name binding.
 *    - Derivation of properties - this is for properties that only exist once the full
 *      Presentation/Section/Element structure is known. For example, previous/next section
 *      relationships.
 *
 *    By the end of pre-compilation, compilation must be able to complete without (runtime) errors.
 *
 * 2. Compilation:
 *    Generation of the Presentation/Section/Element tree.
 *
 * ## (2) Flow of control during the compilation process
 *
 * For both steps, higher levels objects proceed prior to lower level ones:
 *
 * Presentation.beforeCompile():
 *   validateAndDerive()
 *   for each section: section.beforeCompile()
 *
 * This means that, for example, Section.beforeCompile() can rely on the fact that
 * Presentation.validateAndDerive() has already been executed.
 *
 * ## (3) Code pattern for pre-compilation and compilation steps
 *
 * Compilers for Presentation/Section/Element all follow the same code pattern:
 *
 */
export class PresentationCompiler {
  // Structural relationships
  //
  private builder_: PresentationBuilder;
  private sections_: SectionCompiler[];

  // Owned properties
  //
  private module_: Module;
  private sortedExpressions_: Expression[] | null = null;

  constructor(builder: PresentationBuilder) {
    this.builder_ = builder;

    this.module_ = Module.createRootModule();

    this.sections_ = builder.sections.map(
      (sectionBuilder) =>
        new SectionCompiler({
          sectionBuilder,
          presentationCompiler: this,
        }),
    );
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
   * Perform pre-compilation steps for the presentation.
   */
  private beforeCompile() {
    this.validateAndDerive();

    this.sections_.forEach((section) => section.beforeCompile());

    this.finalize();
  }

  private validateAndDerive() {
    this.connectAdjacentSections();
  }

  private connectAdjacentSections() {
    if (this.sections_.length <= 1) {
      return;
    }

    for (let i = 0; i < this.sections_.length - 1; i++) {
      // '!' is safe - array elements are never undefined
      const currentSection = this.sections_[i]!;
      const nextSection = this.sections_[i + 1]!;

      currentSection.setNextSection(nextSection);
      nextSection.setPreviousSection(currentSection);
    }
  }

  /**
   * PresentationCompiler differs from other Compiler modules in that it has a post-compilation
   * step: this can then perform validation/derivation that depends on a fully validated tree.
   */
  private finalize() {
    const sortedExpressions = this.module.compile();
    this.sortedExpressions_ = sortedExpressions;
  }

  // ----------------------------------------------------------------------------------------------
  // Compilation steps
  // ----------------------------------------------------------------------------------------------

  compile(): Presentation {
    this.beforeCompile();

    const p = Presentation.create({
      basisDimensions: this.builder_.basisDimensions,
    });

    p.phase2Constructor.setSections(
      this.sections_.map((sectionCompiler) =>
        sectionCompiler.compile(p.presentation),
      ),
    );

    p.phase2Constructor.complete();

    return p.presentation;
  }
}
