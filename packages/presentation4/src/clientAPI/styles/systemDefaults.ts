import type { ComputedElementStyle } from "./ElementStyleProps";
import type { ComputedSectionStyle } from "./SectionStyleProps";

/**
 * The contractual system defaults for element styles.
 *
 * These values are the final fallback in the four-level cascade. They are fixed
 * per major version — changing them is a breaking change. Authors who want
 * different defaults should override via StyleRegistry.setGlobalElementStyle().
 *
 * Font sizes are in basis units, assuming the default basisHeight of 1000.
 * Authors building presentations with a different basisHeight may want to override
 * fontSize in the global style.
 */
export const SYSTEM_DEFAULT_ELEMENT_STYLE: ComputedElementStyle = {
  fill: { type: "none" },
  border: { type: "none" },
  fontFamily: "sans-serif",
  fontSize: 18,
  fontWeight: 400,
  fontColor: { r: 0, g: 0, b: 0, a: 1 },
  fontItalic: false,
};

/**
 * The contractual system defaults for section styles.
 *
 * Sections are transparent with no border by default — the presentation
 * background shows through unless the author explicitly sets a fill.
 */
export const SYSTEM_DEFAULT_SECTION_STYLE: ComputedSectionStyle = {
  fill: { type: "none" },
  border: { type: "none" },
};
