import type { Fill } from "./Fill";
import type { Border, ComputedBorder } from "./Border";
import type { Color } from "./Color";
import type { StyleValue } from "./StyleValue";
import type { FontWeight } from "./Font";
import type { NamedElementStyle } from "./NamedElementStyle";

/**
 * The visual style properties that can be applied to an element.
 *
 * All fields are optional — `undefined` means "not set here; fall through to the
 * next level of the cascade." An explicitly set value (including `{ type: 'none' }`)
 * stops the cascade for that property.
 *
 * Font properties are individually optional so that named styles can override a
 * single dimension (e.g. just `fontWeight`) without re-specifying the rest.
 *
 * ## Cascade order (highest priority first)
 *   1. Element's own style (this interface)
 *   2. Named styles applied to the element (in specification order, first wins)
 *   3. Author's global element style override on the presentation
 *   4. System defaults (SYSTEM_DEFAULT_ELEMENT_STYLE)
 */
export interface ElementStyleProps {
  fill?: Fill;
  border?: Border;
  borderRadius?: StyleValue;
  padding?: StyleValue;
  fontFamily?: string;
  fontSize?: StyleValue;
  fontWeight?: FontWeight;
  fontColor?: Color;
  fontItalic?: boolean;
}

/**
 * A fully resolved element style — every property is present and `StyleValue`
 * sizing has been reduced to a plain number in basis units.
 *
 * This is what the view layer receives. The cascade resolver produces this from
 * the four-level cascade plus system defaults.
 */
export interface ComputedElementStyle {
  fill: Fill;
  border: ComputedBorder;
  /** Border radius in basis units. */
  borderRadius: number;
  /** Padding in basis units (applied uniformly to all four sides). */
  padding: number;
  fontFamily: string;
  /** Font size in basis units. */
  fontSize: number;
  fontWeight: FontWeight;
  fontColor: Color;
  fontItalic: boolean;
}

/** Style accessor bag returned by `element.styles`. */
export interface ElementStyles {
  /** The fully resolved style after cascade evaluation. */
  get computed(): ComputedElementStyle;
  /** The own style — properties set directly on this element, before cascade. */
  get own(): ElementStyleProps;
  /** Set the own style. Overrides named and global styles for any property specified. */
  set(style: ElementStyleProps): void;
  /**
   * Append a named style by reference. Named styles are evaluated in the order
   * they were added; earlier entries take priority.
   */
  addNamed(style: NamedElementStyle): void;
  /** Remove a previously added named style. No-op if not present. */
  removeNamed(style: NamedElementStyle): void;
  /** The named styles currently applied, in priority order. */
  get named(): ReadonlyArray<NamedElementStyle>;
}
