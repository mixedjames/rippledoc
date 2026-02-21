import type { Style } from "@rippledoc/presentation";

export function loadFill(fillEl: Element, target: { style: Style }): void {
  const colorAttr = fillEl.getAttribute("color");
  const imageAttr = fillEl.getAttribute("image");

  if (colorAttr && colorAttr.trim() !== "") {
    const color = parseHexColor(colorAttr);
    target.style.fill.setColor(color);
  }

  if (imageAttr && imageAttr.trim() !== "") {
    target.style.fill.setImageSource(imageAttr.trim());
  }
}

export function parseHexColor(color: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const trimmed = color.trim();
  const match = /^#([0-9a-fA-F]{6})$/.exec(trimmed);

  if (!match) {
    throw new Error(
      `Invalid color format "${color}". Expected "#RRGGBB" (e.g. "#00FF00").`,
    );
  }

  const hex = match[1]!;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16); // eslint-disable-line no-magic-numbers
  const b = parseInt(hex.slice(4, 6), 16); // eslint-disable-line no-magic-numbers

  return { r, g, b, a: 255 };
}
