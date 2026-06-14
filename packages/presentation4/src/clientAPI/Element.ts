import type { Section } from "./Section";
import type { XYAnchors } from "../anchors/index";
import type {
  HorizontalAnchorSet,
  VerticalAnchorSet,
} from "../anchors/AnchorSet";

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

  /** Set the horizontal geometry of this element. Exactly two of left/right/width must be provided. */
  setHorizontalAnchors(descriptor: HorizontalAnchorSet): void;

  /** Set the vertical geometry of this element. Exactly two of top/bottom/height must be provided. */
  setVerticalAnchors(descriptor: VerticalAnchorSet): void;
}
