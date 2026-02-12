import type { Presentation } from "../Presentation";
import type { Section } from "../Section";
import type { Element } from "../Element";

import type { PresentationView } from "./PresentationView";
import type { SectionView } from "./SectionView";
import type { ElementView } from "./ElementView";
import type { ViewFactory } from "./ViewFactory";

import { ImageElement } from "../ImageElement";

class NullPresentationView implements PresentationView {
  realise(): void {
    // no-op
  }

  layout(): void {
    // no-op
  }
}

class NullSectionView implements SectionView {
  realise(): void {
    // no-op
  }

  layout(): void {
    // no-op
  }
}

class NullElementView implements ElementView {
  realise(): void {
    // no-op
  }

  layout(): void {
    // no-op
  }
}

/**
 * Simple ViewFactory implementation for tests.
 *
 * Produces no-op view instances that satisfy the contracts but
 * do not touch the DOM or perform any rendering.
 */
export class NullViewFactory implements ViewFactory {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createPresentationView(_presentation: Presentation): PresentationView {
    return new NullPresentationView();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createSectionView(_section: Section): SectionView {
    return new NullSectionView();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createElementView(_element: Element): ElementView {
    return new NullElementView();
  }

  createImageElementView(element: ImageElement): ElementView {
    return this.createElementView(element);
  }
}

/**
 * Shared singleton instance for convenience in tests.
 */
export const nullViewFactory = new NullViewFactory();
