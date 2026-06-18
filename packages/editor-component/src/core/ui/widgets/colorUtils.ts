import type { Color } from "@rippledoc/presentation4";

const HEX_RADIX = 16;
const HEX_PAD = 2;

export function colorToHex(c: Color): string {
  const ch = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(HEX_RADIX)
      .padStart(HEX_PAD, "0");
  return `#${ch(c.r)}${ch(c.g)}${ch(c.b)}`;
}

/** Returns a Color from a CSS hex string (#RRGGBB) and an alpha 0–1. Null if hex is invalid. */
export function hexToColor(hex: string, a: number): Color | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  const [, rHex, gHex, bHex] = m;
  return {
    r: parseInt(rHex!, HEX_RADIX),
    g: parseInt(gHex!, HEX_RADIX),
    b: parseInt(bHex!, HEX_RADIX),
    a: Math.max(0, Math.min(1, a)),
  };
}

/** Returns alpha as an integer percentage 0–100. */
export function colorToAlphaPct(c: Color): number {
  return Math.round(c.a * 100);
}
