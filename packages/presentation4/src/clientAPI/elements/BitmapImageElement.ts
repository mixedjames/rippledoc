import type { Element } from "../Element";
import type { ImageFit } from "../styles/ImageFit";

/**
 * A BitmapImageElement displays a raster image (PNG, JPEG, WebP, etc.).
 */
export interface BitmapImageElement extends Element {
  /** URL or path to the image source. */
  get src(): string;

  /** Accessible text description of the image. */
  get alt(): string;

  /** How the image scales within its container. Default: 'contain'. */
  get objectFit(): ImageFit;

  setSrc(src: string): void;
  setAlt(alt: string): void;
  setObjectFit(fit: ImageFit): void;
}
