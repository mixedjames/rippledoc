import type { AnimationDriver } from "./AnimationDriver";

/**
 * Wraps an inner AnimationDriver for an SVG sub-component target.
 *
 * All AnimationDriver methods delegate to the inner driver unchanged, except
 * retarget(): when the outer element (e.g. the pin clone div) changes, this
 * driver resolves the CSS selector against the new outer element before
 * forwarding to the inner driver. That way the inner driver always animates
 * the correct element inside whichever SVG copy is currently active.
 *
 * If the selector resolves to null after retarget (shouldn't happen in
 * practice since clones contain the full SVG DOM), the inner driver keeps
 * its previous target.
 */
export class SubComponentDriver implements AnimationDriver {
  private readonly inner_: AnimationDriver;
  private readonly selector_: string;

  constructor(inner: AnimationDriver, selector: string) {
    this.inner_ = inner;
    this.selector_ = selector;
  }

  start(progress: number): void {
    this.inner_.start(progress);
  }

  seek(progress: number): void {
    this.inner_.seek(progress);
  }

  end(progress: number): void {
    this.inner_.end(progress);
  }

  reverseStart(progress: number): void {
    this.inner_.reverseStart(progress);
  }

  reverseEnd(progress: number): void {
    this.inner_.reverseEnd(progress);
  }

  onLayout(scale: number): void {
    this.inner_.onLayout(scale);
  }

  onKeyFramesChanged(): void {
    this.inner_.onKeyFramesChanged();
  }

  setEnabled(enabled: boolean): void {
    this.inner_.setEnabled(enabled);
  }

  /**
   * Resolve the selector against the new outer element and forward to inner_.
   * The outer element is the pin clone div (or the live element div); the
   * matching sub-element lives inside its embedded SVG.
   */
  retarget(element: Element): void {
    const sub = element.querySelector(this.selector_);
    if (sub) this.inner_.retarget(sub);
  }

  destroy(): void {
    this.inner_.destroy();
  }
}
