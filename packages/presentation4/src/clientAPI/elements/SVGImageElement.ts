import type { Element } from "../Element";

/**
 * An SVGImageElement displays a vector image from an SVG source.
 */
export interface SVGImageElement extends Element {
  /** URL or path to the SVG source. */
  get src(): string;

  setSrc(src: string): void;
}
