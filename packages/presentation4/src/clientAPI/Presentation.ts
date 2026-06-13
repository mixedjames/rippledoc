import type { Anchor } from "../anchors/index";
import type { PresentationRoot } from "./PresentationRoot";
import type { LayoutManager } from "./LayoutManager";

/** Options supplied when creating a new presentation. */
export interface PresentationOptions {
  /** Width of the virtual canvas. Defaults to 1000. */
  basisWidth?: number;
  /** Height of the virtual canvas. Defaults to 1000. */
  basisHeight?: number;
}

/**
 * Presentation is the top-level holder object for a RippleDoc presentation.
 *
 * Its role is coordination and containment. It holds the structural root of
 * the document tree and the layout manager, and will eventually hold event
 * listener registration endpoints. Attaching a renderer to the presentation
 * will also be done here.
 *
 * Presentation deliberately does not own content directly — that is the job
 * of PresentationRoot. The split keeps each object's responsibilities narrow.
 */
export interface Presentation {
  /** The root of the document tree: the entry point for sections and elements. */
  get root(): PresentationRoot;

  /** Manages the set of layouts and which layout is currently active. */
  get layout(): LayoutManager;

  /**
   * A live anchor whose value equals the current viewport height in virtual
   * basis-space coordinates. Use it as the `height` expression for any element
   * that should fill the visible viewport. Updates when the view is resized.
   */
  get viewportHeightAnchor(): Anchor;
}
