import { Element } from "./Element";
import { Section } from "./Section";

import { ViewFactory } from "./view/ViewFactory";
import { ElementView } from "./view/ElementView";

import { Expression } from "@rippledoc/expressions";

export enum ImageFit {
  Fill = "fill",
  Contain = "contain",
  Cover = "cover",
}

export class ImageElement extends Element {
  private source_: string;
  private fit_: ImageFit;
  private altText_: string;

  constructor(options: {
    source: string;
    fit?: ImageFit;
    altText?: string;

    element: {
      name: string;
      left: Expression;
      right: Expression;
      width: Expression;
      top: Expression;
      bottom: Expression;
      height: Expression;
      parent: Section;
      viewFactory: ViewFactory;
    };
  }) {
    super(options.element);

    if (typeof options.source !== "string") {
      throw new Error("ImageElement: source must be a string");
    }

    this.source_ = options.source;
    this.fit_ = options.fit ?? ImageFit.Contain;
    this.altText_ = options.altText ?? "";
  }

  get source(): string {
    return this.source_;
  }

  get fit(): ImageFit {
    return this.fit_;
  }

  get altText(): string {
    return this.altText_;
  }

  protected override createView(viewFactory: ViewFactory): ElementView {
    return viewFactory.createImageElementView(this);
  }

  realiseView(): void {
    super.realiseView();
  }

  layoutView(): void {
    super.layoutView();
  }
}
