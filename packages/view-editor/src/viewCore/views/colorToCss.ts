import type { Color, Fill, ComputedBorder } from "@rippledoc/presentation4";

export function colorToCss(c: Color): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

export function fillToCss(fill: Fill): string {
  return fill.type === "none" ? "transparent" : colorToCss(fill.color);
}

/** Returns a complete CSS border shorthand, or 'none' for no border. */
export function borderToCss(border: ComputedBorder, scale: number): string {
  if (border.type === "none") return "none";
  return `${border.width * scale}px ${border.style} ${colorToCss(border.color)}`;
}
