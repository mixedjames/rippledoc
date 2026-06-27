import type { PresentationRoot } from "./PresentationRoot";
import type { LayoutManager } from "./LayoutManager";
import type { PresentationEventSource } from "./PresentationEvents";
import type { ScrollTrigger, ScrollTriggerOptions } from "./ScrollTrigger";
import type { StyleRegistry } from "./styles/StyleRegistry";
import type { PresentationMemento } from "./serialize/PresentationMemento";
// Deliberate cross-layer import: attachView is the seam where client code meets
// the view system. PresentationViewFactory is imported directly from the viewAPI
// source file (not the barrel) to avoid a circular dependency — the viewAPI barrel
// re-exports clientAPI, so importing from the barrel here would be circular.
import type { PresentationViewFactory } from "../viewAPI/PresentationView";

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

  /**
   * Connect a renderer to this presentation. The factory is called immediately
   * with this presentation as the owner; the returned view drives rendering until
   * the next attachView call or the presentation is discarded.
   *
   * Calling attachView a second time tears down the previous view before
   * constructing the new one.
   */
  attachView(factory: PresentationViewFactory): void;

  /** Produce a JSON-serializable snapshot of the presentation's current state. */
  toMemento(): PresentationMemento;
}
