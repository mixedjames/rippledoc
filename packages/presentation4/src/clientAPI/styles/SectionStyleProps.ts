import type { Fill } from "./Fill";
import type { Border, ComputedBorder } from "./Border";

/**
 * The visual style properties that can be applied to a section.
 *
 * Sections support fill and border only — they have no text content of their
 * own, so font properties are absent. Section styles do not cascade down to
 * elements; each element resolves its own cascade independently.
 *
 * ## Cascade order (highest priority first)
 *   1. Section's own style (this interface)
 *   2. Named styles applied to the section (in specification order, first wins)
 *   3. Author's global section style override on the presentation
 *   4. System defaults (SYSTEM_DEFAULT_SECTION_STYLE)
 */
export interface SectionStyleProps {
  fill?: Fill;
  border?: Border;
}

/**
 * A fully resolved section style — every property is present and `StyleValue`
 * sizing has been reduced to a plain number in basis units.
 */
export interface ComputedSectionStyle {
  fill: Fill;
  border: ComputedBorder;
}
