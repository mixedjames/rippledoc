import type { Element } from "../Element";
import type { SubComponentTarget } from "../animation/SubComponentTarget";

/**
 * An SVGImageElement displays a vector image from an SVG source.
 */
export interface SVGImageElement extends Element {
  /** URL or path to the SVG source. */
  get src(): string;

  setSrc(src: string): void;

  /**
   * Returns a SubComponentTarget referencing the sub-element matching selector
   * inside this SVG. Pass the result to KeyFrameAnimationOptions.target.
   *
   * Resolution against the loaded SVG DOM is deferred to the view layer —
   * calling this method does not touch the DOM.
   */
  subComponent(selector: string): SubComponentTarget;
}
