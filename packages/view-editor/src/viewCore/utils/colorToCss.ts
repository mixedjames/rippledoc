import type {
  Color,
  Fill,
  ImageFit,
  ComputedBorder,
} from "@rippledoc/presentation4";

export function colorToCss(c: Color): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

function imageFitToBackgroundSize(fit: ImageFit): string {
  if (fit === "fill") return "100% 100%";
  if (fit === "none") return "auto";
  return fit; // 'cover' and 'contain' are valid CSS values unchanged
}

/**
 * Returns a CSS value for the `background` shorthand property.
 *
 * For image fills the returned value includes url(), background-repeat, an
 * initial background-position of `center`, and background-size. The position
 * can be overridden at runtime by WAAPI `backgroundPositionX/Y` animations
 * (animation cascade origin is higher priority than inline author styles).
 */
export function fillToCss(fill: Fill): string {
  if (fill.type === "none") return "transparent";
  if (fill.type === "solid") return colorToCss(fill.color);
  return `url("${fill.src}") no-repeat center / ${imageFitToBackgroundSize(fill.fit)}`;
}

/** Returns a complete CSS border shorthand, or 'none' for no border. */
export function borderToCss(border: ComputedBorder, scale: number): string {
  if (border.type === "none") return "none";
  return `${border.width * scale}px ${border.style} ${colorToCss(border.color)}`;
}
