import type { Color } from "./Color";
import type { ImageFit } from "./ImageFit";

/**
 * The fill applied to the background of an element or section.
 *
 * `{ type: 'none' }` is an explicit "no fill" — it stops the cascade at that
 * level rather than falling through to a lower-priority style.
 *
 * `{ type: 'image' }` renders a background image. The `fit` controls how the
 * image scales within its container (maps to CSS `background-size`). The image
 * position starts at 0 0 and can be animated via `backgroundPositionX/Y`
 * keyframes.
 */
export type Fill =
  | { type: "solid"; color: Color }
  | { type: "none" }
  | { type: "image"; src: string; fit: ImageFit };
