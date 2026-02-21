import type {
  ScrollTriggerInternal,
  Presentation,
} from "@rippledoc/presentation";
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
  private readonly presentation_: Presentation;
  private readonly triggers_: ScrollTriggerInternal[] = [];

  constructor(options: {
    scrollingElement: HTMLElement;
    presentation: Presentation;
  }) {
    this.scrollingElement_ = options.scrollingElement;
    this.presentation_ = options.presentation;

    safariScrollFix(this.scrollingElement_);

    addRAFThrottledScrollListener({
      target: this.scrollingElement_,
      callback: (scrollTop: number) => {
        // Convert DOM scrollTop (in viewport pixels) to presentation
        // coordinates using the current presentation geometry.
        const geometry = this.presentation_.geometry;
        const scale = geometry.scale || 1;
        const scrollPosition = scrollTop / scale;

        // Forward scaled scroll position to any registered internal triggers.
        this.triggers_.forEach((trigger) => {
          trigger.onScroll(scrollPosition);
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
