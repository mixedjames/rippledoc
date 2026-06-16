import { ElementBuilder } from "../ElementBuilder";
import { SectionBuilder } from "../../section/SectionBuilder";
import { TextBoxCompiler } from "./TextBoxElementCompiler";
import { SectionCompiler } from "../../section/SectionCompiler";
import { ElementCompiler } from "../ElementCompiler";

export class TextBoxBuilder extends ElementBuilder {
  private htmlContent_: Node = document.createDocumentFragment();

  constructor(options: { section: SectionBuilder }) {
    super(options);
  }

  makeCompiler(sectionCompiler: SectionCompiler): ElementCompiler {
    return new TextBoxCompiler({
      elementBuilder: this,
      sectionCompiler: sectionCompiler,
    });
  }

  get htmlContent(): Node {
    return this.htmlContent_;
  }

  set htmlContent(value: Node) {
    this.htmlContent_ = value;
  }
}
