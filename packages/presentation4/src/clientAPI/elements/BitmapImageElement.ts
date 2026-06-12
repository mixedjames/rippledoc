import type { Element } from "../Element";

/**
 * A BitmapImageElement displays a raster image (PNG, JPEG, WebP, etc.).
 */
export interface BitmapImageElement extends Element {
  /** URL or path to the image source. */
  get src(): string;

  /** Accessible text description of the image. */
  get alt(): string;

  setSrc(src: string): void;
  setAlt(alt: string): void;
}
