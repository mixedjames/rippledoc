import { PresentationBuilder } from "./PresentationBuilder";
import {
  Presentation,
  Phase2Constructor,
  ContentDependentElement,
} from "./Presentation";
import { SectionCompiler } from "../section/SectionCompiler";
import { Element } from "../element/Element";

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
  private expressionToElement_ = new Map<Expression, ContentDependentElement>();

  private slideHeightNativeExpression_: ((newFn: () => number) => void) | null =
    null;

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

  /**
   * Called by ElementCompiler.compile to report content-dependent Elements.
   *
   * View code updates valueHolder.value to provide the content-dependent value.
   *
   * @param element The element that is content-dependent.
   * @param expression The expression that is content-dependent
   * @param valueHolder
   */
  declareContentDependentElement(
    element: Element,
    expression: Expression,
    valueHolder: { value: number },
  ): void {
    this.expressionToElement_.set(expression, { element, valueHolder });
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

  private validateAndDerive(): void {
    this.connectAdjacentSections();
    this.mapNamedSections();
    this.mapBasisGeometry();

    const nativeExpression = this.module.addNativeExpression2(
      "slideHeight",
      () => 1,
    );
    this.slideHeightNativeExpression_ = nativeExpression.replaceNativeFunction;
  }

  private connectAdjacentSections(): void {
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

  private mapNamedSections(): void {
    // Create a the 'sections' namespace: this enables expressions on sections and elements (they
    // inherit the parent section's namespace) to refer to sections by name, e.g.
    // "sections.Section1.top"
    //
    // Notes:
    // (1) We only map sections that have names
    //     Possible FIXME: might be nice to support referring to sections by index?
    // (2) We use the rootModule for the namespace - this prevents the new namespace from being
    //     contaminated with other stuff in the section's namespace.
    //

    const sectionNamespace = this.module.rootModule.addSubModule();
    this.module.mapModule("sections", sectionNamespace);

    this.sections_.forEach((s) => {
      if (s.builder.hasName) {
        sectionNamespace.mapModule(s.builder.name, s.module);
      }
    });
  }

  private mapBasisGeometry(): void {
    // Basic dimension stored into temporaries. I'm not sure with closures exactly what is saved:
    // Are we capturing builder_, or basisDimensions?
    //
    // In either case this creates a brittleness and potential memory leak - we want to discard all
    // of the builder data after compilation, and closures mustn't prevent this.
    //

    const basisWidth = this.builder_.basisDimensions.width;
    const basisHeight = this.builder_.basisDimensions.height;

    this.module.addNativeExpression("basisWidth", () => basisWidth);
    this.module.addNativeExpression("basisHeight", () => basisHeight);
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
      slideHeightNativeExpression: this.slideHeightNativeExpression_!,
      stylesheet: this.builder_.stylesheet,
    });

    p.phase2Constructor.setSections(
      this.sections_.map((sectionCompiler) =>
        sectionCompiler.compile(p.presentation),
      ),
    );

    this.buildSortedContentDependentElementList(p.phase2Constructor);

    p.phase2Constructor.complete();

    return p.presentation;
  }

  /**
   * At this point we have:
   * - A list of Expressions sorted by dependency order (i.e. if Expression A depends on Expression
   *   B, then B will appear before A in the list).
   * - A mapping from Expressions to the content-dependent Element that they are associated with.
   *
   * We can use these to build a list of content-dependent Elements sorted by dependency order. This
   * is important because it allows us to update the content-dependent Elements in a single pass
   * (i.e. we can guarantee that when we update an Element, all of the Elements that it depends on
   * have already been updated).
   *
   * We then pass this list to the Presentation via the Phase2Constructor.
   */
  private buildSortedContentDependentElementList(
    phase2Constructor: Phase2Constructor,
  ): void {
    const list: ContentDependentElement[] = [];

    // ! ok as never null at this phase in compilation (i.e. post-beforeCompile)
    this.sortedExpressions_!.forEach((e: Expression) => {
      if (this.expressionToElement_.has(e)) {
        list.push(this.expressionToElement_.get(e)!);
      }
    });

    phase2Constructor.setSortedContentDependentElements(list);
  }
}
