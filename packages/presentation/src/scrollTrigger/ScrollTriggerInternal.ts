import type { ScrollTrigger } from "./ScrollTrigger";

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

  constructor(scrollTrigger: ScrollTrigger) {
    this.scrollTrigger_ = scrollTrigger;
  }

  get scrollTrigger(): ScrollTrigger {
    return this.scrollTrigger_;
  }

  onScroll(scrollY: number): void {
    // Not implemented yet
    console.log(
      `ScrollTriggerInternal.onScroll: scrollY=${scrollY}, triggerStart=${this.scrollTrigger_.start}, triggerEnd=${this.scrollTrigger_.end}`,
    );
  }
}
