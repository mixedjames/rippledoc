import type { PresentationRoot } from "./PresentationRoot";
import type { Element } from "./Element";
import type { XYAnchors } from "../anchors/index";
import type { VerticalAnchorSet } from "../anchors/AnchorSet";
import type { MarkdownElement } from "./elements/MarkdownElement";
import type { BitmapImageElement } from "./elements/BitmapImageElement";
import type { SVGImageElement } from "./elements/SVGImageElement";
import type { SectionAnimations } from "./animation/SectionAnimations";

/**
 * A Section is a horizontal slice of a RippleDoc presentation.
 *
 * Sections are owned by PresentationRoot and stacked vertically in the order
 * they were created. Each section spans the full width of the presentation.
 *
 * Sections own elements, but elements are positioned in the global virtual
 * coordinate space — not relative to the section. The section's own geometry
 * (its vertical position and height) is what the anchor system exposes for
 * other objects to reference.
 */
export interface Section {
  /** The presentation root that owns this section. */
  get root(): PresentationRoot;

  /**
   * The anchors defining this section's geometry in the virtual coordinate space.
   *
   * All six anchors are readable and usable as references when positioning elements.
   * Which anchors can be independently constrained (vs. derived) depends on how the
   * section is configured — refer to the concrete implementation or LayoutManager.
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

  /** Set the vertical geometry of this section. Exactly two of top/bottom/height must be provided. */
  setVerticalAnchors(descriptor: VerticalAnchorSet): void;

  /** Keyframe animations attached to this section. */
  get animations(): SectionAnimations;

  /** Adds a new markdown element owned by this section. */
  addMarkdownElement(markdown?: string): MarkdownElement;

  /** Adds a new bitmap image element owned by this section. */
  addBitmapImageElement(): BitmapImageElement;

  /** Adds a new SVG image element owned by this section. */
  addSVGImageElement(): SVGImageElement;

  /** Returns all elements owned by this section, in the order they were added. */
  getElements(): readonly Element[];

  /**
   * Removes an element from this section and destroys its view.
   * Throws if the element does not belong to this section.
   */
  removeElement(element: Element): void;
}
