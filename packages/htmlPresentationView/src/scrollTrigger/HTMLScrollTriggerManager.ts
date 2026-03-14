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
  private scrollingElement_: HTMLElement | null;
  private readonly presentation_: Presentation;
  private readonly triggers_: ScrollTriggerInternal[] = [];

  constructor(options: { presentation: Presentation }) {
    this.presentation_ = options.presentation;
    this.scrollingElement_ = null;
  }

  private attachScrollListener(target: HTMLElement): void {
    safariScrollFix(target);

    addRAFThrottledScrollListener({
      target,
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

  get scrollingElement(): HTMLElement | null {
    return this.scrollingElement_;
  }

  /**
   * Rebinds scroll handling to a new DOM element. Existing listeners remain
   * attached, but the provided element becomes the canonical scrollingElement
   * and will also drive trigger updates.
   */
  setScrollingElement(scrollingElement: HTMLElement): void {
    if (this.scrollingElement_ === scrollingElement) {
      return;
    }

    this.scrollingElement_ = scrollingElement;
    this.attachScrollListener(scrollingElement);
  }
}
