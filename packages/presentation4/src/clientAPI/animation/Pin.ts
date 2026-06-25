import type { ScrollTrigger } from "../ScrollTrigger";

/**
 * Pins an element at its current scroll position while the trigger is active.
 *
 * While the trigger is active the element stays visually fixed in the viewport,
 * and any additional scroll distance accumulates as an offset applied once
 * pinning ends. Multiple sequential pins on the same element compose correctly.
 *
 * The DOM mechanics (cloning, absolute positioning, deltaY tracking) are
 * entirely owned by the view layer and invisible to clients.
 */
export interface Pin {
  get trigger(): ScrollTrigger;

  /** Replace the scroll trigger. Emits pin:triggerChanged. */
  setTrigger(trigger: ScrollTrigger): void;
}
