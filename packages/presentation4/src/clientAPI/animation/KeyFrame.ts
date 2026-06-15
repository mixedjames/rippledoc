/**
 * A single keyframe in a KeyFrameAnimation.
 *
 * position is the point in time (in ms, matching the animation's duration) at
 * which this keyframe applies. All other properties are optional — only the
 * properties present are interpolated.
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

  readonly backgroundPositionX?: number;

  readonly backgroundPositionY?: number;

  readonly strokeDashoffset?: number;

  /** High-level stroke-draw percentage (0–100). Only valid on SVGPathElements. */
  readonly traceStroke?: number;

  readonly transform?: string;
};
