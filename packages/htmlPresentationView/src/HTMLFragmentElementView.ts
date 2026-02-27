import { HTMLElementView } from "./HTMLElementView";
import type { HTMLFragmentElement } from "@rippledoc/presentation";

/**
 * HTML view for HTMLElement model nodes.
 *
 * This view takes the DOM fragment carried by the model element
 * and clones it into the element's root container.
 */
export class HTMLFragmentElementView extends HTMLElementView {
  private readonly htmlElement_: HTMLFragmentElement;

  constructor(options: { element: HTMLFragmentElement }) {
    super(options);
    this.htmlElement_ = options.element;
  }

  override realise(): void {
    super.realise();

    const root = this.rootElement;
    if (!root) {
      throw new Error(
        "HTMLFragmentElementView.realise() called before HTMLElementView.realise()",
      );
    }

    // Replace any default content with the cloned fragment.
    root.innerHTML = "";

    const fragment = this.htmlElement_.fragment;
    const cloned = fragment.cloneNode(true) as DocumentFragment;
    root.appendChild(cloned);
  }

  override layout(): void {
    super.layout();
  }
}
