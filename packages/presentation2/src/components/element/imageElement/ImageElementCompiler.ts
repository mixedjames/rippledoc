import { SectionCompiler } from "../../section/SectionCompiler";
import { Section } from "../../section/Section";
import { ElementCompiler } from "../ElementCompiler";
import { ImageElementBuilder } from "./ImageElementBuilder";
import { ImageElement } from "./ImageElement";

export class ImageElementCompiler extends ElementCompiler {
  constructor(options: {
    elementBuilder: ImageElementBuilder;
    sectionCompiler: SectionCompiler;
  }) {
    super(options);
  }

  get builder() {
    // We know this is a ImageElementBuilder because of the type signature of the constructor, but the
    // base class only knows it's an ElementBuilder, so we have to cast it here.
    return super.builder as ImageElementBuilder;
  }

  protected subclassValidateAndDerive() {}

  compile(section: Section): ImageElement {
    const { element, phase2Constructor } = ImageElement.createImageElement({
      elementOptions: this.buildElementOptions(section),
      source: this.builder.source,
      fit: this.builder.fit,
    });

    this.defaultPhase2Construction(element, phase2Constructor);

    return element;
  }
}
