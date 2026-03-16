import type {
  ViewFactory,
  PresentationView,
  SectionView,
  Presentation,
  Section,
  Element,
  ImageElement,
  HTMLFragmentElement,
} from "@rippledoc/presentation";

import { HTMLPresentationView } from "./HTMLPresentationView";
import { HTMLSectionView } from "./HTMLSectionView";
import { HTMLElementView } from "./HTMLElementView";
import { HTMLImageElementView } from "./HTMLImageElementView";
import { HTMLFragmentElementView } from "./HTMLFragmentElementView";

/**
 * HTML implementation of the ViewFactory.
 *
 */
export class HTMLViewFactory implements ViewFactory {
  private readonly root_: HTMLElement;
  private readonly scrollingElement_: HTMLElement;

  constructor(options: { root: HTMLElement; scrollingElement?: HTMLElement }) {
    this.root_ = options.root;
    this.scrollingElement_ = options.scrollingElement ?? options.root;
  }

  createPresentationView(presentation: Presentation): HTMLPresentationView {
    return new HTMLPresentationView({
      presentation,
      root: this.root_,
      scrollingElement: this.scrollingElement_,
    });
  }

  createSectionView(
    section: Section,
    parentView: PresentationView,
  ): HTMLSectionView {
    return new HTMLSectionView({
      section,
      parentView: parentView as HTMLPresentationView,
    });
  }

  createElementView(
    element: Element,
    parentView: SectionView,
  ): HTMLElementView {
    return new HTMLElementView({
      element,
      parentView: parentView as HTMLSectionView,
    });
  }

  createImageElementView(
    element: ImageElement,
    parentView: SectionView,
  ): HTMLElementView {
    return new HTMLImageElementView({
      element,
      parentView: parentView as HTMLSectionView,
    });
  }

  createHTMLFragmentElementView(
    element: HTMLFragmentElement,
    parentView: SectionView,
  ): HTMLElementView {
    return new HTMLFragmentElementView({
      element,
      parentView: parentView as HTMLSectionView,
    });
  }
}
