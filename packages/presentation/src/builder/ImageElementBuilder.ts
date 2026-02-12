import { ElementBuilder } from "./ElementBuilder";
import type { ViewFactory } from "../view/ViewFactory";
import type { Section } from "../Section";
import { ImageElement } from "../ImageElement";

import type { Module } from "@rippledoc/expressions";

export class ImageElementBuilder extends ElementBuilder {
  private source_ = "";

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

  override build(options: { parent: Section }): ImageElement {
    return new ImageElement({
      source: this.source_,
      element: this.getBuildOptions({ parent: options.parent }),
    });
  }
}
