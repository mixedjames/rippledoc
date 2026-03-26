import { PresentationBuilder } from "../presentation/PresentationBuilder";
import { ElementBuilder } from "../element/ElementBuilder";
import { TextBoxBuilder } from "../element/textBoxElement/TextBoxElementBuilder";
import { ImageElementBuilder } from "../element/imageElement/ImageElementBuilder";
import { ScrollTriggerBuilder } from "../scrollTrigger/ScrollTriggerBuilder";

export class SectionBuilder {
  private presentation_: PresentationBuilder;
  private elements_: ElementBuilder[] = [];

  private scrollTriggers_: ScrollTriggerBuilder[] = [];

  private name_ = "";

  private sectionHeight_: string = "";
  private sectionBottom_: string = "";

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

  addTextBox(): TextBoxBuilder {
    const textBoxBuilder = new TextBoxBuilder({ section: this });
    this.elements_.push(textBoxBuilder);
    return textBoxBuilder;
  }

  addImageElement(): ImageElementBuilder {
    const elementBuilder = new ImageElementBuilder({ section: this });
    this.elements_.push(elementBuilder);
    return elementBuilder;
  }

  addScrollTrigger(): ScrollTriggerBuilder {
    const scrollTriggerBuilder = new ScrollTriggerBuilder({ section: this });
    this.scrollTriggers_.push(scrollTriggerBuilder);
    return scrollTriggerBuilder;
  }

  get elements(): readonly ElementBuilder[] {
    return this.elements_;
  }

  get scrollTriggers(): readonly ScrollTriggerBuilder[] {
    return this.scrollTriggers_;
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

  get hasSectionHeight(): boolean {
    return this.sectionHeight_.trim().length > 0;
  }

  get sectionBottom(): string {
    return this.sectionBottom_;
  }

  set sectionBottom(value: string) {
    this.sectionBottom_ = value;
  }

  get hasSectionBottom(): boolean {
    return this.sectionBottom_.trim().length > 0;
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
