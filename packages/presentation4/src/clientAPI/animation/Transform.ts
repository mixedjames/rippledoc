/**
 * An ordered sequence of transform operations applied to an animated element.
 *
 * Steps are applied in array order, which matches the visual/CSS convention:
 * [translate, rotate] means "move then rotate around the new origin", while
 * [rotate, translate] means "rotate first, then move along the rotated axis".
 * The distinction matters — translate(50,0) then rotate(45deg) produces a
 * different result from rotate(45deg) then translate(50,0).
 *
 * TranslateStep x/y values are in basis units. The view multiplies by the
 * current LayoutTransform.scale when writing CSS pixel values, so the
 * animation scales correctly with the presentation viewport.
 */

/** Translate along x and/or y. Values are in basis units. */
export type TranslateStep = {
  readonly type: "translate";
  readonly x?: number;
  readonly y?: number;
};

/** Rotate around the element's transform origin. Value is in degrees. */
export type RotateStep = {
  readonly type: "rotate";
  readonly degrees: number;
};

/**
 * Scale along x and y independently. Values are unitless multipliers.
 * For uniform scaling set x === y; the view emits scale(n) in that case.
 */
export type ScaleStep = {
  readonly type: "scale";
  readonly x: number;
  readonly y: number;
};

export type TransformStep = TranslateStep | RotateStep | ScaleStep;
