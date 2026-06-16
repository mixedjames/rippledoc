import { ElementBuilder } from "../ElementBuilder";
import { SectionBuilder } from "../../section/SectionBuilder";
import { ImageElementCompiler } from "./ImageElementCompiler";
import { ImageFit } from "./ImageElement";
import { SectionCompiler } from "../../section/SectionCompiler";
import { ElementCompiler } from "../ElementCompiler";

export class ImageElementBuilder extends ElementBuilder {
  private source_: string = "";
  private fit_: ImageFit = ImageFit.Fill;

  constructor(options: { section: SectionBuilder }) {
    super(options);
  }

  makeCompiler(sectionCompiler: SectionCompiler): ElementCompiler {
    return new ImageElementCompiler({
      elementBuilder: this,
      sectionCompiler: sectionCompiler,
    });
  }

  get source(): string {
    return this.source_;
  }

  set source(value: string) {
    this.source_ = value;
  }

  get fit(): ImageFit {
    return this.fit_;
  }

  set fit(value: ImageFit) {
    this.fit_ = value;
  }
}
