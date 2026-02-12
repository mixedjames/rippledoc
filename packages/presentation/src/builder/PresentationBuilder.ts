import { Module } from "@rippledoc/expressions";

import type { ViewFactory } from "../view/ViewFactory";
import { Presentation, PresentationGeometry } from "../Presentation";
import { SectionBuilder } from "./SectionBuilder";

/**
 * Builder for constructing an immutable Presentation instance.
 *
 * Responsibilities:
 * - Collect slide layout and sections
 * - Finalize all builders
 * - Compile the module
 * - Build final Presentation
 */
export class PresentationBuilder {
  private readonly module_: Module;
  private readonly viewFactory_: ViewFactory;
  private readonly sections_: SectionBuilder[] = [];

  private geometry_: PresentationGeometry = new PresentationGeometry();

  private built_ = false;

  constructor(options: { viewFactory: ViewFactory }) {
    const { viewFactory } = options;
    if (!viewFactory)
      throw new Error("PresentationBuilder requires a viewFactory");

    this.viewFactory_ = viewFactory;
    this.module_ = Module.createRootModule();
  }

  // ───────────────────────────────────────────────
  // Construction-phase API
  // ───────────────────────────────────────────────

  setSlideWidth(value: number): void {
    this.assertNotBuilt("setSlideWidth");

    this.geometry_.setBasisDimensions(value, this.geometry_.basis.height);
  }

  setSlideHeight(value: number): void {
    this.assertNotBuilt("setSlideHeight");
    this.geometry_.setBasisDimensions(this.geometry_.basis.width, value);
  }

  createSection(): SectionBuilder {
    this.assertNotBuilt("createSection");
    const section = new SectionBuilder({
      parentModule: this.module_,
      viewFactory: this.viewFactory_,
    });
    this.sections_.push(section);
    return section;
  }

  /**
   * Finalize all slide-level expressions and sections.
   * Must be called before build().
   */
  private finalize(): void {
    this.assertNotBuilt("finalize");

    // Register slideWidth/slideHeight as module expressions
    const geometry = this.geometry_; // capture 'this' for the closures
    this.module_.addNativeExpression("slideWidth", () => geometry.basis.width);
    this.module_.addNativeExpression(
      "slideHeight",
      () => geometry.basis.height,
    );

    // Experimental:
    this.module_.addNativeExpression("viewportHeight", () => {
      return geometry.viewport.height / geometry.scale;
    });

    // Wire section adjacency
    // FIXME: have to use '!' here - we know the sections are defined, but TypeScript doesn't.
    for (let i = 0; i < this.sections_.length; i++) {
      if (i > 0) {
        this.sections_[i]!.setPrevious(this.sections_[i - 1]!);
      }

      if (i < this.sections_.length - 1) {
        this.sections_[i]!.setNext(this.sections_[i + 1]!);
      }
    }

    // Finalize each section builder
    this.sections_.forEach((s) => s.finalize());

    // Wire named sections under the 'sections' namespace
    const namedSections = this.module_.rootModule.addSubModule();
    this.sections_.forEach((sectionBuilder) => {
      const name = sectionBuilder.getName();
      if (!name || name.length === 0) {
        return;
      }

      namedSections.mapModule(name, sectionBuilder.moduleInstance);
    });
    this.module_.mapModule("sections", namedSections);
  }

  // ───────────────────────────────────────────────
  // Build phase
  // ───────────────────────────────────────────────

  build(): Presentation {
    this.assertNotBuilt("build");

    this.finalize();

    // Compile all module expressions
    this.built_ = true;
    this.module_.compile();

    const presentation = new Presentation({
      geometry: this.geometry_,
      sections: [],
      viewFactory: this.viewFactory_,
    });

    const builtSections = this.sections_.map((s) =>
      s.build({ parent: presentation }),
    );
    presentation._setSections(builtSections);

    return presentation;
  }

  // ───────────────────────────────────────────────
  // Internal helpers
  // ───────────────────────────────────────────────

  private assertNotBuilt(method: string): void {
    if (this.built_)
      throw new Error(
        `PresentationBuilder.${method}: Builder is no longer usable`,
      );
  }
}
