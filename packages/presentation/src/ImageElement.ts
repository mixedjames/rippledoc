import { Element } from "./Element";
import { Section } from "./Section";

import { ViewFactory } from "./view/ViewFactory";
import { ElementView } from "./view/ElementView";

import { Expression } from "@rippledoc/expressions";

export class ImageElement extends Element {
  private source_: string;

  constructor(options: {
    source: string;

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
  }

  get source(): string {
    return this.source_;
  }

  protected override createView(viewFactory: ViewFactory): ElementView {
    return viewFactory.createElementView(this);
  }

  realiseView(): void {
    super.realiseView();
  }

  layoutView(): void {
    super.layoutView();
  }
}
