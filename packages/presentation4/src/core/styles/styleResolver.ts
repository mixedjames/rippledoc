import type {
  ElementStyleProps,
  ComputedElementStyle,
} from "../../clientAPI/styles/ElementStyleProps";
import type {
  SectionStyleProps,
  ComputedSectionStyle,
} from "../../clientAPI/styles/SectionStyleProps";
import type { Border, ComputedBorder } from "../../clientAPI/styles/Border";
import type { StyleValue } from "../../clientAPI/styles/StyleValue";
import {
  SYSTEM_DEFAULT_ELEMENT_STYLE,
  SYSTEM_DEFAULT_SECTION_STYLE,
} from "../../clientAPI/styles/systemDefaults";

// ── Shared helpers ────────────────────────────────────────────────────────────

function applyStyleValue(sv: StyleValue, globalBasis: number): number {
  // basis values are used as-is; relative values scale against the global basis.
  return sv.unit === "basis" ? sv.value : sv.value * globalBasis;
}

/**
 * Determine the global reference value (in basis units) for a StyleValue property.
 * The global basis is the author's global value when it's an explicit basis quantity;
 * otherwise the system default provides the reference so relative values are always
 * meaningful.
 */
function globalBasisFor(
  authorValue: StyleValue | undefined,
  systemDefault: number,
): number {
  if (authorValue?.unit === "basis") return authorValue.value;
  return systemDefault;
}

/**
 * Resolve a Border (which may carry a StyleValue width) to a ComputedBorder
 * (plain number width, in basis units).
 */
function resolveBorder(
  border: Border,
  borderWidthBasis: number,
): ComputedBorder {
  if (border.type === "none") return { type: "none" };
  return {
    type: "border",
    width: applyStyleValue(border.width, borderWidthBasis),
    style: border.style,
    color: border.color,
  };
}

/**
 * The global basis value for border width: from the author's global border if it
 * is an absolute border, otherwise from the system default (0 when no default border).
 */
function borderWidthBasisFor(
  authorBorder: Border | undefined,
  systemDefaultBorder: ComputedBorder,
): number {
  if (authorBorder?.type === "border" && authorBorder.width.unit === "basis") {
    return authorBorder.width.value;
  }
  return systemDefaultBorder.type === "border" ? systemDefaultBorder.width : 0;
}

// ── Element style resolution ──────────────────────────────────────────────────

/**
 * Resolve the four-level element style cascade to a fully computed style.
 *
 * Cascade order (highest priority first):
 *   1. own       — the element's own style
 *   2. named[]   — named styles in the order they were applied (first wins)
 *   3. global    — the author's presentation-level global override
 *   4. system    — SYSTEM_DEFAULT_ELEMENT_STYLE (always fully specified)
 *
 * StyleValue properties with unit:'relative' resolve against the global basis
 * value, which is the author's global value when it is a 'basis' quantity,
 * otherwise the system default. This means relative values always scale from a
 * single, predictable reference — they do not compound across cascade levels.
 */
export function resolveElementStyle(
  own: ElementStyleProps,
  named: readonly ElementStyleProps[],
  authorGlobal: ElementStyleProps,
  systemDefault: ComputedElementStyle = SYSTEM_DEFAULT_ELEMENT_STYLE,
): ComputedElementStyle {
  const sources = [own, ...named, authorGlobal];

  // Find the first source that provides a value for the given key.
  function first<K extends keyof ElementStyleProps>(
    key: K,
  ): ElementStyleProps[K] | undefined {
    for (const src of sources) {
      if (src[key] !== undefined) return src[key];
    }
    return undefined;
  }

  const fontSizeBasis = globalBasisFor(
    authorGlobal.fontSize,
    systemDefault.fontSize,
  );
  const bwBasis = borderWidthBasisFor(
    authorGlobal.border,
    systemDefault.border,
  );

  const rawBorder = first("border");
  const border: ComputedBorder =
    rawBorder !== undefined
      ? resolveBorder(rawBorder, bwBasis)
      : systemDefault.border;

  const rawFontSize = first("fontSize");
  const fontSize =
    rawFontSize !== undefined
      ? applyStyleValue(rawFontSize, fontSizeBasis)
      : systemDefault.fontSize;

  return {
    fill: first("fill") ?? systemDefault.fill,
    border,
    fontFamily: first("fontFamily") ?? systemDefault.fontFamily,
    fontSize,
    fontWeight: first("fontWeight") ?? systemDefault.fontWeight,
    fontColor: first("fontColor") ?? systemDefault.fontColor,
    fontItalic: first("fontItalic") ?? systemDefault.fontItalic,
  };
}

// ── Section style resolution ──────────────────────────────────────────────────

/**
 * Resolve the four-level section style cascade to a fully computed style.
 * Same cascade order and relative-unit semantics as resolveElementStyle.
 */
export function resolveSectionStyle(
  own: SectionStyleProps,
  named: readonly SectionStyleProps[],
  authorGlobal: SectionStyleProps,
  systemDefault: ComputedSectionStyle = SYSTEM_DEFAULT_SECTION_STYLE,
): ComputedSectionStyle {
  const sources = [own, ...named, authorGlobal];

  function first<K extends keyof SectionStyleProps>(
    key: K,
  ): SectionStyleProps[K] | undefined {
    for (const src of sources) {
      if (src[key] !== undefined) return src[key];
    }
    return undefined;
  }

  const bwBasis = borderWidthBasisFor(
    authorGlobal.border,
    systemDefault.border,
  );

  const rawBorder = first("border");
  const border: ComputedBorder =
    rawBorder !== undefined
      ? resolveBorder(rawBorder, bwBasis)
      : systemDefault.border;

  return {
    fill: first("fill") ?? systemDefault.fill,
    border,
  };
}
