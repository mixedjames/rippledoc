import { ElementBuilder } from "./ElementBuilder";
import type { ViewFactory } from "../view/ViewFactory";
import type { Section } from "../Section";
import { ImageElement, ImageFit } from "../ImageElement";

import type { Module } from "@rippledoc/expressions";

export class ImageElementBuilder extends ElementBuilder {
  private source_: string = "";
  private fit_ = ImageFit.Contain;
  private altText_: string = "";

  constructor(options: { parentModule: Module; viewFactory: ViewFactory }) {
    super(options);
  }

  setSource(source: string): void {
    this.assertNotBuilt("setSource");

    if (typeof source !== "string" || source.trim() === "") {
      throw new Error("ImageElementBuilder: source must be a non-empty string");
    }

    this.source_ = source;
  }

  setFit(fit: ImageFit): void {
    this.assertNotBuilt("setFit");

    if (!Object.values(ImageFit).includes(fit)) {
      throw new Error(`ImageElementBuilder: invalid fit value "${fit}"`);
    }

    this.fit_ = fit;
  }

  setAltText(altText: string): void {
    this.assertNotBuilt("setAltText");

    if (typeof altText !== "string") {
      throw new Error("ImageElementBuilder: altText must be a string");
    }

    this.altText_ = altText;
  }

  override build(options: { parent: Section }): ImageElement {
    return new ImageElement({
      source: this.source_,
      fit: this.fit_,
      altText: this.altText_,
      element: this.getBuildOptions({ parent: options.parent }),
    });
  }
}
