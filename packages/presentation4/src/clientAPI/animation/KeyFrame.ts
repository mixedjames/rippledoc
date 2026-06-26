import type { TransformStep } from "./Transform";

/**
 * A single keyframe in a KeyFrameAnimation.
 *
 * position is the point in time (in ms, matching the animation's duration) at
 * which this keyframe applies. All other properties are optional — only the
 * properties present are interpolated.
 *
 * ## Units
 * backgroundPositionX/Y are in basis units (the view scales by LayoutTransform.scale).
 * transform steps that translate are also in basis units; rotate is degrees; scale is
 * unitless. See Transform.ts for details.
 *
 * ## Stroke tracing
 * traceStroke is a high-level percentage (0–100) expressing how much of an SVG
 * path's stroke has been "drawn". The view translates this to strokeDasharray /
 * strokeDashoffset using the path's total length — the clientAPI does not expose
 * those CSS details.
 */
export type KeyFrame = {
  readonly position: number;

  readonly opacity?: number;

  /** Horizontal background position in basis units. */
  readonly backgroundPositionX?: number;

  /** Vertical background position in basis units. */
  readonly backgroundPositionY?: number;

  readonly strokeDashoffset?: number;

  /** High-level stroke-draw percentage (0–100). Only valid on SVGPathElements. */
  readonly traceStroke?: number;

  /**
   * Ordered list of transform operations. Steps are applied in array order;
   * the order matters because translate-then-rotate ≠ rotate-then-translate.
   */
  readonly transform?: readonly TransformStep[];
};
