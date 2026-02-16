import { TriggerPoint } from "./TriggerPoint";

/**
 * Important Note: this is an internal class not exposed publicly.
 *
 * Represents a single scroll trigger with start and end points.
 * Maintains reference to the triggering element for layout event handling.
 */

export enum TriggerState {
  Before = "before",
  Active = "active",
  After = "after",
}

/**
 * Data passed to trigger callbacks describing current scroll state and positions.
 */
export interface TriggerEventData {
  state: TriggerState;
  progress: number;
  trigger: {
    currentY: number;
    startY: number;
    endY: number;
  };
}

/**
 * Optional callbacks fired as the trigger enters, exits, or remains in its active range.
 */
export interface TriggerCallbacks {
  onScroll?(event: TriggerEventData): void;
  onStart?(event: TriggerEventData): void;
  onEnd?(event: TriggerEventData): void;
  onReverseStart?(event: TriggerEventData): void;
  onReverseEnd?(event: TriggerEventData): void;
}

/**
 * Configuration for a single trigger boundary (start or end) relative to the viewport.
 */
export interface TriggerPointConfig {
  element: HTMLElement;
  elementY: number;
  viewportY: number;
}

/**
 * Parameters used to construct a Trigger instance.
 */
export interface TriggerParams {
  viewport: HTMLElement;
  start: TriggerPointConfig;
  end: TriggerPointConfig;
  callbacks?: TriggerCallbacks;
}

export class Trigger {
  // TriggerPoint instances for start and end of the trigger
  // We ensure start is always before end
  private start_: TriggerPoint;
  private end_: TriggerPoint;

  // Callbacks object containing optional event handlers
  private callbacks_: TriggerCallbacks;

  // Track previous state to avoid redundant callbacks
  private lastState_: TriggerState;

  /**
   * Creates a new Trigger instance.
   */
  constructor({ viewport, start, end, callbacks = {} }: TriggerParams) {
    this.callbacks_ = callbacks;
    this.lastState_ = TriggerState.Before;

    // Create TriggerPoint instances for start and end
    // We rely on TriggerPoint to validate parameters

    this.start_ = new TriggerPoint({
      element: start.element,
      elementY: start.elementY,
      viewport,
      viewportY: start.viewportY,
    });

    this.end_ = new TriggerPoint({
      element: end.element,
      elementY: end.elementY,
      viewport,
      viewportY: end.viewportY,
    });

    this.refresh(viewport);
  }

  /**
   * Handles scroll updates for this trigger.
   * @param scrollY - Current scroll position
   */
  onScroll(scrollY: number): void {
    /**
     * Algorithm:
     * 1. Determine current state based on scroll position relative to start/end triggers
     * 2. Calculate progress (0-1) if between triggers
     * 3. Dispatch start events if entering active range
     * 4. Dispatch scroll event if in active range
     * 5. Dispatch end events if exiting active range
     */

    const startY = this.start_.triggerY;
    const endY = this.end_.triggerY;

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

    const eventData: TriggerEventData = {
      state,
      progress,
      trigger: { currentY: scrollY, startY, endY },
    };

    // 1. Dispatch start events when entering active range
    if (
      state === TriggerState.Active &&
      this.lastState_ !== TriggerState.Active
    ) {
      // Entering from top (scrolling down)
      if (this.lastState_ === TriggerState.Before && this.callbacks_.onStart) {
        this.callbacks_.onStart(eventData);
      }
      // Entering from bottom (scrolling up)
      else if (
        this.lastState_ === TriggerState.After &&
        this.callbacks_.onReverseStart
      ) {
        this.callbacks_.onReverseStart(eventData);
      }
    }

    // 2. Dispatch scroll event while in active range
    if (state === TriggerState.Active && this.callbacks_.onScroll) {
      this.callbacks_.onScroll(eventData);
    }

    // 3. Dispatch end events when exiting active range
    if (
      state !== TriggerState.Active &&
      this.lastState_ === TriggerState.Active
    ) {
      // Exiting at bottom (scrolling down)
      if (state === TriggerState.After && this.callbacks_.onEnd) {
        this.callbacks_.onEnd(eventData);
      }
      // Exiting at top (scrolling up)
      else if (state === TriggerState.Before && this.callbacks_.onReverseEnd) {
        this.callbacks_.onReverseEnd(eventData);
      }
    }

    this.lastState_ = state;
  }

  /**
   * Responds to layout changes (resize, orientation change, etc.).
   */
  refresh(viewport: HTMLElement): void {
    // Refresh trigger point calculations based on current layout
    this.start_.refresh(viewport);
    this.end_.refresh(viewport);

    // Handle case where start and end are reversed
    // Client may use layouts where determining order is difficult
    if (this.start_.triggerY > this.end_.triggerY) {
      const temp = this.start_;
      this.start_ = this.end_;
      this.end_ = temp;
    }
  }
}
