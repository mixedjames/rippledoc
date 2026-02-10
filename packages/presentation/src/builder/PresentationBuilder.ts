import { Module } from "@expressions";
import type { Expression } from "@expressions";

import type { ViewFactory } from "../view/ViewFactory";
import { Section } from "../Section";
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
	private readonly module: Module;
	private readonly viewFactory: ViewFactory;
	private readonly sections: SectionBuilder[] = [];

  private geometry: PresentationGeometry = new PresentationGeometry();

	private built = false;

	constructor(options: { viewFactory: ViewFactory }) {
		const { viewFactory } = options;
		if (!viewFactory) throw new Error("PresentationBuilder requires a viewFactory");

		this.viewFactory = viewFactory;
		this.module = Module.createRootModule();
	}

	// ───────────────────────────────────────────────
	// Construction-phase API
	// ───────────────────────────────────────────────

	setSlideWidth(value: number): void {
		this.assertNotBuilt("setSlideWidth");
    
		if (value <= 0) {
      throw new Error("Slide width must be > 0");
    }

    this.geometry.basis.width = value;
	}

	setSlideHeight(value: number): void {
		this.assertNotBuilt("setSlideHeight");
		if (value <= 0) {
      throw new Error("Slide height must be > 0");
    }
    this.geometry.basis.height = value;
	}

	createSection(): SectionBuilder {
		this.assertNotBuilt("createSection");
		const section = new SectionBuilder({
			parentModule: this.module,
			viewFactory: this.viewFactory,
		});
		this.sections.push(section);
		return section;
	}

	/**
	 * Finalize all slide-level expressions and sections.
	 * Must be called before build().
	 */
	private finalize(): void {
		this.assertNotBuilt("finalize");

		// Register slideWidth/slideHeight as module expressions
    const geometry = this.geometry; // capture 'this' for the closures
		this.module.addNativeExpression("slideWidth", () => geometry.basis.width);
		this.module.addNativeExpression("slideHeight", () => geometry.basis.height);

		// Wire section adjacency
    // FIXME: have to use '!' here - we know the sections are defined, but TypeScript doesn't.
		for (let i = 0; i < this.sections.length; i++) {
			if (i > 0) {
        this.sections[i]!.setPrevious(this.sections[i - 1]!);
      }
      
			if (i < this.sections.length - 1) {
        this.sections[i]!.setNext(this.sections[i + 1]!);
      }
		}

		// Finalize each section builder
		this.sections.forEach((s) => s.finalize());

		// Wire named sections under the 'sections' namespace
		const namedSections = this.module.rootModule.addSubModule();
		this.sections.forEach((sectionBuilder) => {
			const name = sectionBuilder.getName();
			if (!name || name.length === 0) {
				return;
			}

			namedSections.mapModule(name, sectionBuilder.moduleInstance);
		});
		this.module.mapModule("sections", namedSections);
	}

	// ───────────────────────────────────────────────
	// Build phase
	// ───────────────────────────────────────────────

	build(): Presentation {
		this.assertNotBuilt("build");

    this.finalize();

		// Compile all module expressions
		this.built = true;
		this.module.compile();

		const presentation = new Presentation({
      geometry: this.geometry,
			sections: [],
			viewFactory: this.viewFactory,
		});

		const builtSections = this.sections.map((s) => s.build({ parent: presentation }));
		presentation._setSections(builtSections);

		return presentation;
	}

	// ───────────────────────────────────────────────
	// Internal helpers
	// ───────────────────────────────────────────────

	private assertNotBuilt(method: string): void {
		if (this.built) throw new Error(`PresentationBuilder.${method}: Builder is no longer usable`);
	}
}
