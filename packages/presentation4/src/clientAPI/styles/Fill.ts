import type { Color } from "./Color";

/**
 * The fill applied to the background of an element or section.
 *
 * `{ type: 'none' }` is an explicit "no fill" — it stops the cascade at that
 * level rather than falling through to a lower-priority style.
 */
export type Fill = { type: "solid"; color: Color } | { type: "none" };
