import type { ScrollTrigger } from "./ScrollTrigger";

enum TriggerState {
  Before = "before",
  Active = "active",
  After = "after",
}

/**
 * Internal representation of a ScrollTrigger within the presentation system.
 *
 * This class manages the View-independent logic of a ScrollTrigger.
 *
 * Note: the wiring for these is a bit complex.
 * 1. ScrollTrigger instances are created as part of the construction of Sections and
 *    Elements.
 * 2. ScrollTriggerInternal instances are created from ScrollTrigger instances during
 *    the construction of Section and Element objects.
 * 3. ScrollTriggerInternal instances are registered with the view so that they can
 *    receive scroll updates and trigger animations as needed.
 *
 * This multilayer approach is complex but has some advantages:
 * - It keeps the ScrollTrigger class free of any view-related logic, making it simpler
 *   for clients.
 * - It allows the view to manage the lifecycle of ScrollTriggerInternal instances.
 *   This is important because the view knows how to efficiently batch scroll updates
 *   and can avoid unnecessary work for triggers that are not currently visible.
 *
 * @internal This is an internal implementation detail and should not be used directly.
 */
export class ScrollTriggerInternal {
  private scrollTrigger_: ScrollTrigger;

  // Track previous state to avoid redundant callbacks
  private lastState_: TriggerState = TriggerState.Before;

  constructor(scrollTrigger: ScrollTrigger) {
    this.scrollTrigger_ = scrollTrigger;
  }

  get scrollTrigger(): ScrollTrigger {
    return this.scrollTrigger_;
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

    const startY = this.scrollTrigger_.start;
    const endY = this.scrollTrigger_.end;

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
        this.scrollTrigger_.emit("start", { progress });
      }
      // Entering from bottom (scrolling up)
      else if (this.lastState_ === TriggerState.After) {
        this.scrollTrigger_.emit("reverseStart", { progress });
      }
    }

    // 2. Dispatch scroll event while in active range
    if (state === TriggerState.Active) {
      this.scrollTrigger_.emit("scroll", { progress });
    }

    // 3. Dispatch end events when exiting active range
    if (
      state !== TriggerState.Active &&
      this.lastState_ === TriggerState.Active
    ) {
      // Exiting at bottom (scrolling down)
      if (state === TriggerState.After) {
        this.scrollTrigger_.emit("end", { progress });
      }
      // Exiting at top (scrolling up)
      else if (state === TriggerState.Before) {
        this.scrollTrigger_.emit("reverseEnd", { progress });
      }
    }

    // 4. Update last state
    this.lastState_ = state;
  }
}
