import type { XYAnchors } from "../anchors/XYAnchors";
import type { VerticalAnchorSet } from "../anchors/AnchorSet";
import type { AnchorExpression } from "../anchors/Anchor";

/**
 * Events emitted by a ScrollTrigger. Each carries the current progress (0–1)
 * through the trigger's range at the moment the event fires.
 */
export type ScrollTriggerEvents = {
  /** Scroll entered the trigger range from above (scrolling down). */
  start: { progress: number };
  /** Scroll exited the trigger range downward (scrolling down). */
  end: { progress: number };
  /** Scroll entered the trigger range from below (scrolling up). */
  reverseStart: { progress: number };
  /** Scroll exited the trigger range upward (scrolling up). */
  reverseEnd: { progress: number };
  /** Scroll position moved while inside the trigger range. */
  scroll: { progress: number };
};

/** Options supplied when creating a ScrollTrigger via Presentation.addScrollTrigger(). */
export interface ScrollTriggerOptions {
  /** Exactly two of top/bottom/height must be provided. */
  top?: AnchorExpression;
  bottom?: AnchorExpression;
  height?: AnchorExpression;
  /** Optional identifier, useful for debugging. */
  name?: string;
}

/**
 * A scroll trigger defines a vertical range in the presentation's virtual
 * coordinate space and emits typed events as the scroll position crosses its
 * boundaries or moves within them.
 *
 * Vertical position is managed via the same anchor system used by sections
 * and elements. Horizontal anchors are fixed to zero (triggers have no width).
 */
export interface ScrollTrigger {
  /** The six-anchor geometry bag. Horizontal anchors are always 0. */
  get anchors(): XYAnchors;

  /** Resolved horizontal geometry — always 0 for a scroll trigger. */
  get left(): number;
  get right(): number;
  get width(): number;

  /** Resolved vertical geometry in virtual coordinates. */
  get top(): number;
  get bottom(): number;
  get height(): number;

  /** Replace the vertical anchor constraints for the active layout. */
  setVerticalAnchors(set: VerticalAnchorSet): void;

  /** Subscribe to scroll trigger events. Returns an unsubscribe function. */
  on<K extends keyof ScrollTriggerEvents>(
    event: K,
    listener: (payload: ScrollTriggerEvents[K]) => void,
  ): () => void;

  /** Optional identifier supplied at construction time. */
  get name(): string;
}
