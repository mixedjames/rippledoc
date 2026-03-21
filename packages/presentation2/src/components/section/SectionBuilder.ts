import { PresentationBuilder } from "../presentation/PresentationBuilder";
import { ElementBuilder } from "../element/ElementBuilder";

export class SectionBuilder {
  private presentation_: PresentationBuilder;
  private elements_: ElementBuilder[] = [];

  private name_ = "";

  private sectionHeight_: string = "";

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

  get sectionHeight(): string {
    return this.sectionHeight_;
  }

  set sectionHeight(value: string) {
    this.sectionHeight_ = value;
  }

  get name(): string {
    return this.name_;
  }

  set name(value: string) {
    this.name_ = value;
  }

  get hasName(): boolean {
    return this.name_.trim().length > 0;
  }
}
