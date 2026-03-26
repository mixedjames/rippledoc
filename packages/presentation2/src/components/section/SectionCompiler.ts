import { Section } from "./Section";
import { SectionBuilder } from "./SectionBuilder";

import { Presentation } from "../presentation/Presentation";
import { PresentationCompiler } from "../presentation/PresentationCompiler";

import { ElementCompiler } from "../element/ElementCompiler";

import { Module, Expression } from "@rippledoc/expressions";
import { ScrollTriggerCompiler } from "../scrollTrigger/ScrollTriggerCompiler";

export class SectionCompiler {
  // Structural relationships
  //
  private builder_: SectionBuilder;
  private presentationCompiler_: PresentationCompiler;
  private elements_: ElementCompiler[];

  private prevSection_: SectionCompiler | null = null;
  private nextSection_: SectionCompiler | null = null;

  // Owned properties
  //
  private module_: Module;

  private sectionTop_: (() => Expression) | null = null;
  private sectionBottom_: (() => Expression) | null = null;
  private sectionHeight_: (() => Expression) | null = null;

  private scrollTriggers_: ScrollTriggerCompiler[] = [];

  constructor(options: {
    sectionBuilder: SectionBuilder;
    presentationCompiler: PresentationCompiler;
  }) {
    this.builder_ = options.sectionBuilder;
    this.presentationCompiler_ = options.presentationCompiler;
    this.module_ = this.presentationCompiler_.module.addSubModule();

    this.elements_ = options.sectionBuilder.elements.map((elementBuilder) =>
      elementBuilder.makeCompiler(this),
    );

    this.scrollTriggers_ = options.sectionBuilder.scrollTriggers.map(
      (scrollTriggerBuilder) =>
        new ScrollTriggerCompiler({
          scrollTriggerBuilder,
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

  get presentationCompiler(): PresentationCompiler {
    return this.presentationCompiler_;
  }

  get builder(): SectionBuilder {
    return this.builder_;
  }

  setNextSection(nextSection: SectionCompiler) {
    this.nextSection_ = nextSection;
    this.module.mapModule("nextSection", nextSection.module);
  }

  setPreviousSection(previousSection: SectionCompiler) {
    this.prevSection_ = previousSection;
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
    this.scrollTriggers_.forEach((scrollTrigger) =>
      scrollTrigger.beforeCompile(),
    );
    this.elements_.forEach((element) => element.beforeCompile());
  }

  private validateAndDerive() {
    //
    //
    this.sectionTop_ = this.module.addExpression(
      "sectionTop",
      this.prevSection_ ? "prevSection.sectionBottom" : "0",
    );

    if (this.builder.hasSectionHeight && !this.builder.hasSectionBottom) {
      this.sectionHeight_ = this.module.addExpression(
        "sectionHeight",
        this.builder_.sectionHeight,
      );
      this.sectionBottom_ = this.module.addExpression(
        "sectionBottom",
        this.prevSection_
          ? "prevSection.sectionBottom + sectionHeight"
          : "sectionHeight",
      );
    } else if (
      !this.builder.hasSectionHeight &&
      this.builder.hasSectionBottom
    ) {
      this.sectionBottom_ = this.module.addExpression(
        "sectionBottom",
        this.builder_.sectionBottom,
      );
      this.sectionHeight_ = this.module.addExpression(
        "sectionHeight",
        "sectionBottom - sectionTop",
      );
    } else {
      throw new Error(
        `Section must specify exactly one of 'sectionHeight' or 'sectionBottom'`,
      );
    }

    // Create a the 'elements' namespace: this enables expressions on sections and elements (they
    // inherit the parent section's namespace) to refer to elements by name, e.g.
    // "elements.Element1.bottom"
    //
    // Notes:
    // (1) We only map elements that have names
    //     Possible FIXME: might be nice to support referring to elements by index?
    // (2) We use the rootModule for the namespace - this prevents the new namespace from being
    //     contaminated with other stuff in the section's namespace.
    //
    const elementsNamespace = this.module.rootModule.addSubModule();
    this.module.mapModule("elements", elementsNamespace);

    this.elements_.forEach((e) => {
      if (e.builder.hasName) {
        elementsNamespace.mapModule(e.builder.name, e.module);
      }
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Compilation steps
  // ----------------------------------------------------------------------------------------------

  /**
   * See Presentation.compile() for symantics of this method & pattern of implementation
   * Do not duplicate that comment here - single point of truth.
   */
  compile(presentation: Presentation): Section {
    const s = Section.create({
      presentation,
      sectionTop: this.sectionTop_!(),
      sectionHeight: this.sectionHeight_!(),
      sectionBottom: this.sectionBottom_!(),
      name: this.builder_.name,
    });

    s.phase2Constructor.setElements(
      this.elements_.map((ec: ElementCompiler) => {
        return ec.compile(s.section);
      }),
    );

    s.phase2Constructor.setScrollTriggers(
      this.scrollTriggers_.map((st) => st.compile(s.section)),
    );

    s.phase2Constructor.complete();

    return s.section;
  }
}
