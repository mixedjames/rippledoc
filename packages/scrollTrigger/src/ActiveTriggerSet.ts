import { Trigger } from "./Trigger";

interface ActiveTriggerSetParams {
  viewport: HTMLElement;
  triggers: Trigger[];
}

/**
 * Manages a set of active triggers.
 *
 * Exists to allow later optimizations where we only update triggers that are currently active.
 * For now it simply holds all triggers and updates them all on scroll.
 */
export class ActiveTriggerSet {
  private viewport_: HTMLElement;
  private triggers_: Trigger[] = [];

  constructor({ viewport, triggers }: ActiveTriggerSetParams) {
    this.viewport_ = viewport;
    this.triggers_ = triggers;
  }

  forEach(callback: (trigger: Trigger) => void): void {
    this.triggers_.forEach((t) => {
      callback(t);
    });
  }
}
