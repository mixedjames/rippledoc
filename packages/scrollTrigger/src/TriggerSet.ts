import { addRAFThrottledScrollListener } from "./RAFThrottledScrollListener";
import { ActiveTriggerSet } from "./ActiveTriggerSet";
import { Trigger } from "./Trigger";
import { safariScrollFix } from "./SafariScrollFix";

/**
 * Important Note: this is an internal class not exposed publicly.
 *
 * Manages a set of scroll triggers.
 *
 * In particular it handles two key tasks:
 * 1. Attaching a single scroll listener to the viewport that updates all triggers
 *    (RAF throttling is used to limit update frequency)
 * 2. Managing an ActiveTriggerSet that only updates triggers that are currently active
 */

export interface TriggerSetParams {
  viewport: HTMLElement;
  triggers: Trigger[];
}

export class TriggerSet {
  private viewport_: HTMLElement;
  private triggers_: Trigger[] = [];
  private activeTriggers_: ActiveTriggerSet;

  /**
   * Creates a new TriggerSet instance.
   * @param params Configuration parameters
   */
  constructor({ viewport, triggers }: TriggerSetParams) {
    this.viewport_ = viewport;
    this.triggers_ = triggers.slice();
    this.activeTriggers_ = new ActiveTriggerSet({
      viewport,
      triggers: this.triggers_,
    });

    addRAFThrottledScrollListener({
      target: viewport,
      callback: this.onScroll.bind(this),
    });

    safariScrollFix(viewport);
  }

  /**
   * Handles scroll events by updating all active triggers with current scroll position.
   */
  onScroll(): void {
    const y = this.viewport_.scrollTop;
    this.activeTriggers_.forEach((t: Trigger) => {
      t.onScroll(y);
    });
  }

  /**
   * Refreshes all triggers to recalculate positions based on current layout.
   */
  refresh(): void {
    this.triggers_.forEach((t: Trigger) => {
      t.refresh(this.viewport_);
    });
  }
}
