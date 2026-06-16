/**
 * A colour value in the presentation model.
 *
 * All channels are plain numbers — no CSS colour strings anywhere in the model.
 * The view layer is responsible for converting to the appropriate CSS representation.
 */
export interface Color {
  /** Red channel, 0–255. */
  r: number;
  /** Green channel, 0–255. */
  g: number;
  /** Blue channel, 0–255. */
  b: number;
  /** Alpha channel, 0–1. */
  a: number;
}
