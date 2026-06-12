import type { Section } from "./Section";
import type { XYAnchors } from "../anchors/index";

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
}
