import type {
  ScrollTrigger,
  ScrollTriggerEvents,
  ScrollTriggerOptions,
} from "../clientAPI/ScrollTrigger";
import type { XYAnchors } from "../anchors/XYAnchors";
import type { VerticalAnchorSet } from "../anchors/AnchorSet";
import type { Layout } from "../clientAPI/Layout";
import type { LayoutManager } from "../clientAPI/LayoutManager";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { TypedEmitter } from "../common/TypedEmitter";
import { constant } from "../anchors/factories";

enum TriggerState {
  Before = "before",
  Active = "active",
  After = "after",
}

/**
 * Concrete implementation of ScrollTrigger.
 *
 * Extends AnchoredObjectBase so its vertical range participates in the same
 * anchor system as sections and elements. Horizontal anchors are permanently
 * fixed to 0 — triggers have no width.
 *
 * onScroll() is called by CorePresentation on every scroll notification and
 * drives the state machine that emits typed events to subscribers.
 */
export class CoreScrollTrigger
  extends AnchoredObjectBase
  implements ScrollTrigger
{
  private readonly name_: string;
  private readonly listeners_ = new TypedEmitter<ScrollTriggerEvents>();
  private lastState_: TriggerState = TriggerState.Before;

  constructor(layoutManager: LayoutManager, options: ScrollTriggerOptions) {
    super(layoutManager);

    this.name_ = options.name ?? "";

    // Triggers are infinitely thin horizontally — they only span a vertical range.
    this.setHorizontalAnchors_({ left: constant(0), width: constant(0) });

    this.setVerticalAnchors_({
      top: options.top,
      bottom: options.bottom,
      height: options.height,
    });
  }

  // ── ScrollTrigger (clientAPI) ─────────────────────────────────────────────

  get anchors(): XYAnchors {
    return super.anchors;
  }

  setVerticalAnchors(set: VerticalAnchorSet): void {
    this.setVerticalAnchors_(set);
  }

  on<K extends keyof ScrollTriggerEvents>(
    event: K,
    listener: (payload: ScrollTriggerEvents[K]) => void,
  ): () => void {
    return this.listeners_.on(event, listener);
  }

  get name(): string {
    return this.name_;
  }

  // ── Layout lifecycle ──────────────────────────────────────────────────────

  /** Called by CorePresentation when a new layout is added to the presentation. */
  onLayoutAdded(layout: Layout): void {
    this.initLayoutEntry_(layout);
  }

  // ── Scroll state machine ──────────────────────────────────────────────────

  /**
   * Called by CorePresentation on every scroll notification.
   *
   * Determines the new state (Before / Active / After), computes progress
   * within the range, then emits transition and continuous events in order:
   *   start/reverseStart → scroll → end/reverseEnd
   *
   * This ordering guarantees that listeners always receive a start event
   * before any scroll event, and an end event after the last scroll event.
   */
  onScroll(scrollY: number): void {
    const startY = this.top;
    const endY = this.bottom;

    let state: TriggerState;
    let progress: number;

    if (scrollY < startY) {
      state = TriggerState.Before;
      progress = 0;
    } else if (scrollY >= endY) {
      state = TriggerState.After;
      progress = 1;
    } else {
      state = TriggerState.Active;
      progress = (scrollY - startY) / (endY - startY);
    }

    // Emit entry events when crossing into the active range.
    if (
      state === TriggerState.Active &&
      this.lastState_ !== TriggerState.Active
    ) {
      if (this.lastState_ === TriggerState.Before) {
        this.listeners_.emit("start", { progress });
      } else {
        this.listeners_.emit("reverseStart", { progress });
      }
    }

    // Emit continuous scroll event while inside the range.
    if (state === TriggerState.Active) {
      this.listeners_.emit("scroll", { progress });
    }

    // Emit exit events when crossing out of the active range.
    if (
      state !== TriggerState.Active &&
      this.lastState_ === TriggerState.Active
    ) {
      if (state === TriggerState.After) {
        this.listeners_.emit("end", { progress });
      } else {
        this.listeners_.emit("reverseEnd", { progress });
      }
    }

    this.lastState_ = state;
  }
}
