import type {
  ViewFactory,
  Presentation,
  Section,
  Element,
  ImageElement,
} from "@rippledoc/presentation";

import { HTMLPresentationView } from "./HTMLPresentationView";
import { HTMLSectionView } from "./HTMLSectionView";
import { HTMLElementView } from "./HTMLElementView";
import { HTMLImageElementView } from "./HTMLImageElementView";

/**
 * HTML implementation of the ViewFactory.
 *
 * This skeleton wires the presentation model to simple DOM-based view
 * classes. The goal here is just to provide a concrete, compiling
 * implementation; the rendering logic is intentionally minimal and can
 * be extended later.
 */
export class HTMLViewFactory implements ViewFactory {
  private readonly root_: HTMLElement;

  constructor(options: { root: HTMLElement }) {
    this.root_ = options.root;
  }

  createPresentationView(presentation: Presentation): HTMLPresentationView {
    return new HTMLPresentationView({ presentation, root: this.root_ });
  }

  createSectionView(section: Section): HTMLSectionView {
    return new HTMLSectionView({ section });
  }

  createElementView(element: Element): HTMLElementView {
    return new HTMLElementView({ element });
  }

  createImageElementView(element: ImageElement): HTMLElementView {
    return new HTMLImageElementView({ element });
  }
}
