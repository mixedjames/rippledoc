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
  private readonly pins_: Pin[] = [];

  constructor(element: Element) {
    this.element_ = element;
  }

  pin(options: { trigger: ScrollTrigger }): Pin {
    const pin = this.element_.view.createPin(options);
    this.pins_.push(pin);
    return pin;
  }

  /**
   * Pins associated with this element's transform.
   *
   * This is a read-only view; callers must not mutate the
   * underlying array. Use ElementTransform.pin() to create
   * additional pins.
   */
  get pins(): readonly Pin[] {
    return this.pins_;
  }
}
