import { ElementBuilder } from "./ElementBuilder";
import {
  ViewFactory,
  Section,
  HTMLFragmentElement,
} from "@rippledoc/presentation";

import type { Module } from "@rippledoc/expressions";

/**
 * Builder for an HTMLFragmentElement within a Section.
 *
 * This is the imperative counterpart to creating an Element with a
 * DOM fragment payload. Layout is handled via the inherited
 * ElementBuilder API; this type only adds the fragment itself.
 */
export class HTMLFragmentElementBuilder extends ElementBuilder {
  private fragment_: DocumentFragment | null = null;

  constructor(options: { parentModule: Module; viewFactory: ViewFactory }) {
    super(options);
  }

  setFragment(fragment: DocumentFragment): void {
    this.assertNotBuilt("setFragment");

    if (!(fragment instanceof DocumentFragment)) {
      throw new Error(
        "HTMLFragmentElementBuilder.setFragment: fragment must be a DocumentFragment",
      );
    }

    this.fragment_ = fragment;
  }

  override build(options: { parent: Section }): HTMLFragmentElement {
    if (!this.fragment_) {
      throw new Error(
        "HTMLFragmentElementBuilder.build: fragment must be set before build()",
      );
    }

    return new HTMLFragmentElement({
      fragment: this.fragment_,
      element: this.getBuildOptions({ parent: options.parent }),
    });
  }
}
