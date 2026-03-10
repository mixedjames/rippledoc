import type { Presentation } from "../model/Presentation";
import type { Section } from "../model/Section";
import type { ContentDependentDimension, Element } from "../model/Element";
import type { HTMLFragmentElement } from "../model/HTMLElement";
import { ImageElement } from "../model/ImageElement";

import type { PresentationView } from "./PresentationView";
import type { SectionView } from "./SectionView";
import type { ElementView } from "./ElementView";
import type { ViewFactory } from "./ViewFactory";

import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { Pin } from "../animation/Pin";

class NullPresentationView implements PresentationView {
  realise(): void {
    // no-op
  }

  layout(): void {
    // no-op
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  declareContentDependentElements(elements: Element[]): void {
    // no-op
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setTriggerMarkerVisibility(visible: boolean): void {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerScrollTriggers(_triggers: readonly unknown[]): void {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getContentDependentDimension(d: ContentDependentDimension): number {
    // no-op, return dummy value

    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerScrollTriggers(_triggers: readonly unknown[]): void {
    // no-op
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createPin(options: { trigger: ScrollTrigger }): Pin {
    // no-op, return dummy Pin instance
    throw new Error("NullElementView does not support creating Pins");
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

  createHTMLFragmentElementView(element: HTMLFragmentElement): ElementView {
    return this.createElementView(element);
  }
}

/**
 * Shared singleton instance for convenience in tests.
 */
export const nullViewFactory = new NullViewFactory();
