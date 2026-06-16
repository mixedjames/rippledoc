import type { Section } from "./Section";
import type { XYAnchors } from "../anchors/index";
import type { AnchorExpression } from "../anchors/Anchor";
import type {
  HorizontalAnchorSet,
  VerticalAnchorSet,
} from "../anchors/AnchorSet";
import type { ElementAnimations } from "./animation/ElementAnimations";
import type {
  ElementStyleProps,
  ComputedElementStyle,
} from "./styles/ElementStyleProps";

/** Which dimension, if any, is determined by content measurement rather than anchor expressions. */
export type ContentDependentDimension = "none" | "width" | "height";

/**
 * Element is the base interface for all content items in a presentation.
 *
 * Elements are owned by sections but positioned in the global virtual coordinate
 * space of the presentation root. This means an element's position is not relative
 * to its section — it can be anchored to any point in the presentation, including
 * anchors from other elements or from the presentation root itself.
 *
 * Concrete element types extend this interface with their content-specific members.
 * Use MarkdownElement, BitmapImageElement, or SVGImageElement rather than Element
 * directly; this interface exists to type collections of mixed elements.
 */
export interface Element {
  /** The section that owns this element. */
  get section(): Section;

  /**
   * The anchors defining this element's geometry in the virtual coordinate space.
   *
   * Elements are positioned globally — these anchors can be constrained relative
   * to any other anchor in the presentation, not just anchors from the owning section.
   */
  get anchors(): XYAnchors;

  /** Resolved horizontal geometry in virtual coordinates. */
  get left(): number;
  get right(): number;
  get width(): number;

  /** Resolved vertical geometry in virtual coordinates. */
  get top(): number;
  get bottom(): number;
  get height(): number;

  /**
   * Which dimension is determined by content measurement. "none" means both
   * axes are fully anchor-expressed. At most one axis may be content-dependent.
   */
  get contentDependentDimension(): ContentDependentDimension;

  /** Pins and animations attached to this element. */
  get animations(): ElementAnimations;

  /** The fully resolved style for this element after cascade evaluation. */
  get computedStyle(): ComputedElementStyle;

  /** Set the element's own style. Overrides named and global styles for any property specified. */
  setStyle(style: ElementStyleProps): void;

  /**
   * Append a named style to this element's style list.
   * Named styles are evaluated in the order they were added; earlier entries take priority.
   */
  addNamedStyle(name: string): void;

  /** Remove a previously added named style. No-op if the name is not present. */
  removeNamedStyle(name: string): void;

  /** The named styles currently applied to this element, in priority order. */
  get namedStyles(): readonly string[];

  /** Set the horizontal geometry of this element. Exactly two of left/right/width must be provided. */
  setHorizontalAnchors(descriptor: HorizontalAnchorSet): void;

  /** Set the vertical geometry of this element. Exactly two of top/bottom/height must be provided. */
  setVerticalAnchors(descriptor: VerticalAnchorSet): void;

  /**
   * Make this element's height content-dependent. The view will measure the
   * rendered height after the width is applied, and feed it back into the anchor
   * system. Clears any previously set vertical anchors.
   *
   * Exactly one of top or bottom must be provided to fix the element's position
   * on the vertical axis; the other edge is derived from the measured height.
   *
   * Throws if width is already content-dependent (both axes cannot be auto).
   */
  setAutoHeight(
    options: { top: AnchorExpression } | { bottom: AnchorExpression },
  ): void;

  /**
   * Make this element's width content-dependent. The view will measure the
   * rendered width after the height is applied, and feed it back into the anchor
   * system. Clears any previously set horizontal anchors.
   *
   * Exactly one of left or right must be provided to fix the element's position
   * on the horizontal axis; the other edge is derived from the measured width.
   *
   * Throws if height is already content-dependent (both axes cannot be auto).
   */
  setAutoWidth(
    options: { left: AnchorExpression } | { right: AnchorExpression },
  ): void;
}
