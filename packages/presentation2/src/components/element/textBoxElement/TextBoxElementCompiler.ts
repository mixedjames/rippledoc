import { SectionCompiler } from "../../section/SectionCompiler";
import { Section } from "../../section/Section";
import { ElementCompiler } from "../ElementCompiler";
import { TextBoxBuilder } from "./TextBoxElementBuilder";
import { TextBoxElement } from "./TextBoxElement";

export class TextBoxCompiler extends ElementCompiler {
  constructor(options: {
    elementBuilder: TextBoxBuilder;
    sectionCompiler: SectionCompiler;
  }) {
    super(options);
  }

  get builder() {
    // We know this is a TextBoxBuilder because of the type signature of the constructor, but the
    // base class only knows it's an ElementBuilder, so we have to cast it here.
    return super.builder as TextBoxBuilder;
  }

  protected subclassValidateAndDerive() {}

  compile(section: Section): TextBoxElement {
    const { element, phase2Constructor } = TextBoxElement.createTextBox({
      elementOptions: this.buildElementOptions(section),
      content: this.builder.htmlContent,
    });

    this.defaultPhase2Construction(element, phase2Constructor);

    return element;
  }
}
