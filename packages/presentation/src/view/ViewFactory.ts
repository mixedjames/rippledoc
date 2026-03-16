import type { Presentation } from "../model/Presentation";
import type { Section } from "../model/Section";
import type { Element } from "../model/Element";
import type { HTMLFragmentElement } from "../model/HTMLElement";

import type { PresentationView } from "./PresentationView";
import type { SectionView } from "./SectionView";
import type { ElementView } from "./ElementView";
import type { ImageElement } from "../model/ImageElement";

/**
 * Factory for creating view instances for the presentation model.
 *
 * Concrete implementations can render to different targets (e.g. DOM,
 * canvas, custom renderers) while sharing the same presentation model.
 */
export interface ViewFactory {
  createPresentationView(presentation: Presentation): PresentationView;

  createSectionView(
    section: Section,
    parentView: PresentationView,
  ): SectionView;

  createElementView(element: Element, parentView: SectionView): ElementView;

  createImageElementView(
    element: ImageElement,
    parentView: SectionView,
  ): ElementView;

  createHTMLFragmentElementView(
    element: HTMLFragmentElement,
    parentView: SectionView,
  ): ElementView;
}
