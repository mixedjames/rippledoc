import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { AnimationDriver } from "./AnimationDriver";
import { WaapiAnimationDriver } from "./WaapiAnimationDriver";
import { SubComponentDriver } from "./SubComponentDriver";
import { KeyFrameDriverPool } from "./KeyFrameDriverPool";

/**
 * What EditorAnimationManager needs from the presentation view.
 *
 * A structural interface avoids a circular import with EditorPresentationView
 * (which imports EditorAnimationManager as a type for its registration Set).
 */
interface AnimationHost {
  readonly animationEnabled: boolean;
  registerAnimationManager(manager: EditorAnimationManager): void;
  unregisterAnimationManager(manager: EditorAnimationManager): void;
}

/**
 * Manages all keyframe animation drivers for a single element view.
 *
 * Delegates driver lifecycle, trigger subscriptions, and presentation-level
 * animation events to KeyFrameDriverPool. This class handles only the
 * element-specific concerns:
 *   - which entity-level events to subscribe to (element:animationAdded/Removed)
 *   - element-specific driver creation (hasTarget / traceStroke guards)
 *   - retarget() for live-element ↔ pin-clone switching
 *   - registration with the animation host
 *
 * Sub-component targeting (animation.hasTarget):
 *   When the element is an SVG image, a resolveSubTarget_ callback is supplied.
 *   If the SVG hasn't loaded yet when the animation is added, the animation is
 *   parked in pending_. Call onSubComponentsChanged() once the SVG DOM is ready
 *   (or when it reloads) to retry resolution for all pending animations.
 *
 *   animation:targetChanged is also handled here: the old driver is removed and
 *   a new one is created against the updated target selector.
 *
 * Deferred driver types (not yet implemented):
 *   - ManualAnimationDriver subclasses (traceStroke) — skipped for now
 */
export class EditorAnimationManager {
  private readonly owner_: p4.ElementViewOwner;
  private target_: HTMLElement;
  private readonly host_: AnimationHost;
  private readonly pool_: KeyFrameDriverPool;
  private readonly unsubscribe_: Array<() => void> = [];

  /** Animations whose sub-component target hasn't resolved yet (SVG not loaded). */
  private readonly pending_: Set<p4.KeyFrameAnimation> = new Set();
  /**
   * All animations this manager is responsible for — used to filter
   * animation:targetChanged events without needing a reverse element lookup.
   */
  private readonly managed_: Set<p4.KeyFrameAnimation> = new Set();

  private readonly resolveSubTarget_:
    | ((selector: string) => Element | null)
    | null;

  constructor(options: {
    owner: p4.ElementViewOwner;
    target: HTMLElement;
    host: AnimationHost;
    /** Resolves a CSS selector to a sub-element inside the SVG DOM. Supplied only for SVG image elements. */
    resolveSubTarget?: (selector: string) => Element | null;
  }) {
    this.owner_ = options.owner;
    this.target_ = options.target;
    this.host_ = options.host;
    this.resolveSubTarget_ = options.resolveSubTarget ?? null;

    const presentation = options.owner.sectionViewOwner.presentationViewOwner;

    this.pool_ = new KeyFrameDriverPool(
      presentation.events,
      () => this.host_.animationEnabled,
    );

    for (const anim of options.owner.animations.keyFrameAnimations) {
      const driver = this.createDriver_(anim);
      if (driver) this.pool_.add(anim, driver);
    }

    this.unsubscribe_.push(
      presentation.events.on(
        "element:animationAdded",
        ({ element, animation }) => {
          if (element !== this.owner_) return;
          const driver = this.createDriver_(animation);
          if (driver) this.pool_.add(animation, driver);
        },
      ),
      presentation.events.on(
        "element:animationRemoved",
        ({ element, animation }) => {
          if (element !== this.owner_) return;
          this.managed_.delete(animation);
          this.pending_.delete(animation);
          this.pool_.remove(animation);
        },
      ),
      // When the user reassigns which SVG sub-element an animation targets,
      // tear down the old driver and build a new one against the new selector.
      presentation.events.on("animation:targetChanged", ({ animation }) => {
        if (!this.managed_.has(animation)) return;
        this.pool_.remove(animation);
        this.pending_.delete(animation);
        const driver = this.createDriver_(animation);
        if (driver) this.pool_.add(animation, driver);
      }),
    );

    options.host.registerAnimationManager(this);
  }

  setEnabled(enabled: boolean): void {
    this.pool_.setEnabled(enabled);
  }

  /** Redirect all drivers to a new DOM element (live element ↔ pin clone). */
  retarget(element: HTMLElement): void {
    this.target_ = element;
    this.pool_.retarget(element);
  }

  layout(scale: number): void {
    this.pool_.layout(scale);
  }

  /**
   * Called by EditorSVGImageElementView when the SVG DOM finishes loading (or
   * reloads). Retries driver creation for all animations that were parked in
   * pending_ because the SVG wasn't ready when they were first added.
   */
  onSubComponentsChanged(): void {
    for (const animation of [...this.pending_]) {
      // createDriver_ will re-attempt resolution; if successful it removes
      // the animation from pending_ and returns the driver.
      const driver = this.createDriver_(animation);
      if (driver) this.pool_.add(animation, driver);
    }
  }

  destroy(): void {
    this.host_.unregisterAnimationManager(this);
    for (const fn of this.unsubscribe_) fn();
    this.unsubscribe_.length = 0;
    this.pool_.destroy();
  }

  private createDriver_(
    animation: p4.KeyFrameAnimation,
  ): AnimationDriver | null {
    // Track every animation this manager is responsible for, regardless of
    // whether we can create a driver for it right now.
    this.managed_.add(animation);

    if (animation.hasTarget) {
      return this.createSubComponentDriver_(animation);
    }

    const needsManual = animation.keyFrames.some(
      (f) => f.traceStroke !== undefined,
    );
    if (needsManual) {
      // traceStroke requires a ManualAnimationDriver subclass (TraceStrokeDriver)
      // not yet implemented. Animation is registered but has no visual effect
      // until the driver is added.
      return null;
    }
    return new WaapiAnimationDriver(animation, this.target_, {
      enabled: this.host_.animationEnabled,
      scale: this.pool_.scale,
    });
  }

  private createSubComponentDriver_(
    animation: p4.KeyFrameAnimation,
  ): AnimationDriver | null {
    if (!this.resolveSubTarget_) {
      // Animation targets a sub-component but this element has no SVG DOM
      // (shouldn't happen in a well-formed presentation, but be defensive).
      return null;
    }
    const selector = animation.target.selector;
    const sub = this.resolveSubTarget_(selector);
    if (!sub) {
      // SVG not loaded yet (or selector doesn't match). Park for later.
      this.pending_.add(animation);
      return null;
    }
    // Remove from pending if it was there (retry path via onSubComponentsChanged).
    this.pending_.delete(animation);
    const inner = new WaapiAnimationDriver(animation, sub, {
      enabled: this.host_.animationEnabled,
      scale: this.pool_.scale,
    });
    return new SubComponentDriver(inner, selector);
  }
}
