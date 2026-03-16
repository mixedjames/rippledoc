import { Element, ContentDependentDimension } from "./Element";
import type { Section } from "./Section";

import type { ViewFactory } from "../view/ViewFactory";
import type { ElementView } from "../view/ElementView";

import type { Expression } from "@rippledoc/expressions";

/**
 * Element subtype that carries a DOM fragment as its content.
 *
 * The core layout, style and scroll-trigger behaviour is inherited
 * from {@link Element}; this type only adds a fragment payload that
 * view implementations can render in a technology-specific way.
 *
 * Named HTMLFragmentElement to avoid clashing with the DOM's
 * built-in HTMLElement interface.
 */
export class HTMLFragmentElement extends Element {
  private readonly fragment_: DocumentFragment;

  constructor(options: {
    fragment: DocumentFragment;
    element: {
      name: string;
      left: Expression;
      right: Expression;
      width: Expression;
      top: Expression;
      bottom: Expression;
      height: Expression;
      contentDependentDimension: ContentDependentDimension;
      replaceNativeFunction?: (fn: () => number) => void;
      parent: Section;
      viewFactory: ViewFactory;
    };
  }) {
    super(options.element);

    this.fragment_ = options.fragment;
  }

  /**
   * DOM fragment representing this element's content.
   *
   * Views are expected to clone this fragment before inserting it
   * into a live DOM tree, so callers should treat it as an immutable
   * template.
   */
  get fragment(): DocumentFragment {
    return this.fragment_;
  }

  protected override createView(viewFactory: ViewFactory): ElementView {
    return viewFactory.createHTMLFragmentElementView(this, this.parent.view);
  }
}
