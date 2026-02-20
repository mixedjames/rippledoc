import type { ScrollTriggerInternal } from "@rippledoc/presentation";
import { addRAFThrottledScrollListener } from "./RAFThrottledScrollListener";
import { safariScrollFix } from "./SafariScrollFix";

/**
 * Central registry for scroll triggers within an HTMLPresentationView.
 *
 * Section and element views forward their trigger registrations here so that
 * scroll-related behaviour can be coordinated from a single place.
 */
export class HTMLScrollTriggerManager {
  private readonly scrollingElement_: HTMLElement;
  private readonly triggers_: ScrollTriggerInternal[] = [];

  constructor(options: { scrollingElement: HTMLElement }) {
    this.scrollingElement_ = options.scrollingElement;

    safariScrollFix(this.scrollingElement_);

    addRAFThrottledScrollListener({
      target: this.scrollingElement_,
      callback: (scrollTop: number) => {
        // Forward scroll position to any registered internal triggers.
        this.triggers_.forEach((trigger) => {
          trigger.onScroll(scrollTop);
        });
      },
    });
  }

  registerTriggers(triggers: readonly ScrollTriggerInternal[]): void {
    if (!triggers || triggers.length === 0) {
      return;
    }
    this.triggers_.push(...triggers);
  }

  get triggers(): readonly ScrollTriggerInternal[] {
    return this.triggers_.slice();
  }

  get scrollingElement(): HTMLElement {
    return this.scrollingElement_;
  }
}
