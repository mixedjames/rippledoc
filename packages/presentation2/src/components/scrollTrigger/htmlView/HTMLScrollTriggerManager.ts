import { HTMLPresentationViewRoot } from "../../presentation/htmlView/HTMLPresentationViewRoot";
import { DefaultScrollTrigger } from "../ScrollTrigger";
import { addRAFThrottledScrollListener } from "./RAFThrottledScrollListener";
import { safariScrollFix } from "./SafariScrollFix";

/**
 * Central registry for scroll triggers within an HTMLPresentationView.
 *
 * Section and element views forward their trigger registrations here so that
 * scroll-related behaviour can be coordinated from a single place.
 */
export class HTMLScrollTriggerManager {
  private readonly htmlPresentationRoot_: HTMLPresentationViewRoot;
  private readonly cachedTriggers_: DefaultScrollTrigger[] = [];

  constructor(options: { htmlPresentationRoot: HTMLPresentationViewRoot }) {
    this.htmlPresentationRoot_ = options.htmlPresentationRoot;

    this.buildScrollTriggerCache();
    this.attachScrollListener(this.htmlPresentationRoot_.htmlViewport);
  }

  private attachScrollListener(target: HTMLElement): void {
    safariScrollFix(target);

    addRAFThrottledScrollListener({
      target,
      callback: (scrollTop: number) => {
        // Convert DOM scrollTop (in viewport pixels) to presentation
        // coordinates using the current presentation geometry.
        const scale = this.htmlPresentationRoot_.physicalDimensions.scale;
        const scrollPosition = scrollTop / scale;

        // Forward scaled scroll position to any registered internal triggers.
        this.cachedTriggers_.forEach((trigger) => {
          trigger.onScroll(scrollPosition);
        });
      },
    });
  }

  get triggers(): readonly DefaultScrollTrigger[] {
    return this.cachedTriggers_;
  }

  private buildScrollTriggerCache(): void {
    this.cachedTriggers_.length = 0;

    // FIXME: We need a better way to collate scroll triggers from the presentation. This is a bit
    // hacky, since it depends on a cast which is brittle in the face of future refactors.
    this.htmlPresentationRoot_.sections.forEach((section) => {
      section.elementViews.forEach((elementView) => {
        elementView.element.scrollTriggers.forEach((trigger) => {
          this.cachedTriggers_.push(trigger as DefaultScrollTrigger);
        });
      });
    });
  }
}
