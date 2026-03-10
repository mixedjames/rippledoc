import { Element } from "../model/Element";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";
import { Pin } from "./Pin";

/**
 * Runtime transform state for an Element.
 *
 * This is intentionally minimal for now. It will later
 * grow to include properties like translation, scale,
 * rotation, opacity, etc.
 */
export class ElementTransform {
  private element_: Element;

  constructor(element: Element) {
    this.element_ = element;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pin(options: { trigger: ScrollTrigger }): Pin {
    throw new Error("Pinning not yet implemented");
  }
}
