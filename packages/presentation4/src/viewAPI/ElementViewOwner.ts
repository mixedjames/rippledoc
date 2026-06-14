import type { Element } from "../clientAPI/Element";
import type { MarkdownElement } from "../clientAPI/elements/MarkdownElement";
import type { BitmapImageElement } from "../clientAPI/elements/BitmapImageElement";
import type { SVGImageElement } from "../clientAPI/elements/SVGImageElement";
import type { SectionViewOwner } from "./SectionViewOwner";

/**
 * ElementViewOwner is the privileged model interface passed to an element view
 * at creation time.
 *
 * It extends the public Element interface with additional context that the view
 * needs but that is not part of the general client API.
 */
export interface ElementViewOwner extends Element {
  // ── Information the view reads ───────────────────────────────────────────

  /** The owner of the section view that created this element view. */
  get sectionViewOwner(): SectionViewOwner;

  // ── Callbacks the view makes into the model ──────────────────────────────

  /**
   * Report the measured content size (in virtual coordinates) back to the model.
   * Called from `measureAndReport()` during the content-dependent layout phase.
   * The model writes the value into the element's size anchor so dependents
   * can chain off it in the subsequent normal layout pass.
   */
  notifyMeasuredSize(size: number): void;
}

/**
 * ViewOwner for a MarkdownElement view. Combines ElementViewOwner with the
 * full MarkdownElement interface so the view can read the markdown content.
 */
export interface MarkdownElementViewOwner
  extends ElementViewOwner, MarkdownElement {}

/**
 * ViewOwner for a BitmapImageElement view.
 */
export interface BitmapImageElementViewOwner
  extends ElementViewOwner, BitmapImageElement {}

/**
 * ViewOwner for an SVGImageElement view.
 */
export interface SVGImageElementViewOwner
  extends ElementViewOwner, SVGImageElement {}
