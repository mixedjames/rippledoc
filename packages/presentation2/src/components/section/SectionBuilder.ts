import { PresentationBuilder } from "../presentation/PresentationBuilder";
import { ElementBuilder } from "../element/ElementBuilder";
import { AxisBuilder } from "../..";

export class SectionBuilder {
  private presentation_: PresentationBuilder;
  private elements_: ElementBuilder[] = [];

  private yAxis_ = new AxisBuilder([
    "sectionTop",
    "sectionHeight",
    "sectionBottom",
  ] as const);

  constructor(options: { presentation: PresentationBuilder }) {
    this.presentation_ = options.presentation;
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get presentation(): PresentationBuilder {
    return this.presentation_;
  }

  addElement(): ElementBuilder {
    const elementBuilder = new ElementBuilder({ section: this });
    this.elements_.push(elementBuilder);
    return elementBuilder;
  }

  get elements(): readonly ElementBuilder[] {
    return this.elements_;
  }

  // ----------------------------------------------------------------------------------------------
  // Owned properties
  // ----------------------------------------------------------------------------------------------

  // Axes
  //

  get yAxis(): AxisBuilder<"sectionTop" | "sectionHeight" | "sectionBottom"> {
    return this.yAxis_;
  }
}
