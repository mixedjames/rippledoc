import type { Color } from "./Color";
import type { StyleValue } from "./StyleValue";

export type BorderEdgeStyle = "solid" | "dashed" | "dotted";

/**
 * A border applied uniformly to all four sides of an element or section.
 *
 * `{ type: 'none' }` is an explicit "no border" — it stops the cascade at that
 * level rather than falling through to a lower-priority style.
 *
 * Per-side border control is not supported in v1; this type can be extended
 * to a per-side variant later without breaking the uniform form.
 */
export type Border =
  | { type: "border"; width: StyleValue; style: BorderEdgeStyle; color: Color }
  | { type: "none" };

/**
 * A fully resolved border where `width` has been reduced to a plain number
 * in basis units. This is what the view layer receives.
 */
export type ComputedBorder =
  | { type: "border"; width: number; style: BorderEdgeStyle; color: Color }
  | { type: "none" };
