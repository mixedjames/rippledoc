import { Expression } from "@rippledoc/expressions";
import { TypedEmitter } from "../common/TypedEmitter";
import { Section } from "../section/Section";
import { Element } from "../element/Element";

export type ScrollTriggerEvents = {
  start: { progress: number };
  end: { progress: number };
  reverseStart: { progress: number };
  reverseEnd: { progress: number };
  scroll: { progress: number };
};

enum TriggerState {
  Before = "before",
  Active = "active",
  After = "after",
}

export interface ScrollTrigger {
  /**
   * Optional name for this trigger, when defined via the builder/XML.
   */
  get name(): string;

  /**
   * Evaluate the configured start expression.
   *
   * Any viewport-related offsets should already be encoded in the
   * underlying expression by the ScrollTriggerBuilder.
   */
  get start(): number;

  /**
   * Evaluate the configured end expression.
   *
   * Any viewport-related offsets should already be encoded in the
   * underlying expression by the ScrollTriggerBuilder.
   */
  get end(): number;

  /**
   * Subscribe to scroll trigger events. Returns an unsubscribe function.
   */
  on<K extends keyof ScrollTriggerEvents>(
    event: K,
    listener: (event: ScrollTriggerEvents[K]) => void,
  ): () => void;
}

/**
 *
 * Do not construct directly – use ScrollTriggerBuilder instead.
 */
export class DefaultScrollTrigger implements ScrollTrigger {
  private parent_: Section | Element;

  private readonly name_: string;
  private start_: Expression;
  private end_: Expression;

  private listeners_ = new TypedEmitter<ScrollTriggerEvents>();

  private lastState_: TriggerState = TriggerState.Before;

  constructor(options: {
    parent: Section | Element;
    start: Expression;
    end: Expression;
    name?: string;
  }) {
    const { parent, start, end, name } = options;

    this.parent_ = parent;
    this.name_ = name ?? "";
    this.start_ = start;
    this.end_ = end;
  }

  /**
   * Subscribe to scroll trigger events. Returns an unsubscribe function.
   */
  on = this.listeners_.on.bind(this.listeners_);

  /**
   * Emit a scroll trigger event. Not intended for external use.
   */
  emit = this.listeners_.emit.bind(this.listeners_);

  get name(): string {
    return this.name_;
  }

  get start(): number {
    return this.start_.evaluate();
  }

  get end(): number {
    return this.end_.evaluate();
  }

  onScroll(scrollY: number): void {
    /**
     * Algorithm:
     * 1. Determine current state based on scroll position relative to start/end triggers
     * 2. Calculate progress (0-1) if between triggers
     * 3. Dispatch start events if entering active range
     * 4. Dispatch scroll event if in active range
     * 5. Dispatch end events if exiting active range
     *
     * Order is key to ensure correct event sequencing:
     * - Listeners must recieve start events before *any* scroll events
     * - Listeners must recieve end events after *all* scroll events
     */

    const startY = this.start;
    const endY = this.end;

    let state: TriggerState;
    let progress: number;

    if (scrollY < startY) {
      // Before the trigger range
      state = TriggerState.Before;
      progress = 0;
    } else if (scrollY >= endY) {
      // After the trigger range
      state = TriggerState.After;
      progress = 1;
    } else {
      // Within the trigger range
      state = TriggerState.Active;
      progress = (scrollY - startY) / (endY - startY);
    }

    // 1. Dispatch start events when entering active range
    if (
      state === TriggerState.Active &&
      this.lastState_ !== TriggerState.Active
    ) {
      // Entering from top (scrolling down)
      if (this.lastState_ === TriggerState.Before) {
        //this.callbacks_.onStart(eventData);
        this.emit("start", { progress });
      }
      // Entering from bottom (scrolling up)
      else if (this.lastState_ === TriggerState.After) {
        this.emit("reverseStart", { progress });
      }
    }

    // 2. Dispatch scroll event while in active range
    if (state === TriggerState.Active) {
      this.emit("scroll", { progress });
    }

    // 3. Dispatch end events when exiting active range
    if (
      state !== TriggerState.Active &&
      this.lastState_ === TriggerState.Active
    ) {
      // Exiting at bottom (scrolling down)
      if (state === TriggerState.After) {
        this.emit("end", { progress });
      }
      // Exiting at top (scrolling up)
      else if (state === TriggerState.Before) {
        this.emit("reverseEnd", { progress });
      }
    }

    // 4. Update last state
    this.lastState_ = state;
  }
}
