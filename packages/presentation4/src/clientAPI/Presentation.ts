import type { PresentationRoot } from "./PresentationRoot";
import type { LayoutManager } from "./LayoutManager";
import type { PresentationEventSource } from "./PresentationEvents";
import type { ScrollTrigger, ScrollTriggerOptions } from "./ScrollTrigger";
import type { StyleRegistry } from "./styles/StyleRegistry";

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

  /** Subscribe to structural, content, geometry, layout, and style change events. */
  get events(): PresentationEventSource;

  /** Named style registry and global style overrides for this presentation. */
  get styles(): StyleRegistry;

  /** All scroll triggers added to this presentation, in insertion order. */
  get triggers(): readonly ScrollTrigger[];

  /**
   * Create a scroll trigger that spans the given vertical range and emit
   * typed events as the scroll position crosses its boundaries.
   *
   * Exactly two of top/bottom/height must be provided (the 2-of-3 rule).
   * The trigger's vertical anchors may reference any other anchor in the
   * presentation (e.g. offsetFrom(section.anchors.top, 100)).
   */
  addScrollTrigger(options: ScrollTriggerOptions): ScrollTrigger;
}
