import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { AnimationDriver } from "./AnimationDriver";
import { WaapiAnimationDriver } from "./WaapiAnimationDriver";

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
 * Subscriptions to trigger events and presentation events are established at
 * construction and kept alive until destroy() — they are structural relationships,
 * not something torn down and rebuilt on mode changes. The animationEnabled flag
 * on the host is the single gate: event handlers return early when it is false,
 * and setEnabled() clears or recreates animation state when the flag changes.
 *
 * Registers itself with the host (EditorPresentationView) so the host can call
 * setEnabled() when the view mode changes.
 *
 * Two subscription scopes:
 *   unsubscribe_  — presentation-level events (animationAdded/Removed, triggerChanged, etc.)
 *   animUnsubs_   — per-animation trigger events (start/scroll/end/reverseStart/reverseEnd),
 *                   keyed by animation so individual animations can be cleanly removed.
 *
 * Deferred driver types (not yet implemented):
 *   - Sub-component targeting (animation.hasTarget) — skipped for now
 *   - ManualAnimationDriver subclasses (traceStroke) — skipped for now
 */
export class EditorAnimationManager {
  private readonly owner_: p4.ElementViewOwner;
  private target_: HTMLElement;
  private readonly host_: AnimationHost;
  private readonly drivers_: Map<p4.KeyFrameAnimation, AnimationDriver> =
    new Map();
  private scale_: number = 1;
  // Presentation-level event subscriptions (animationAdded/Removed, triggerChanged, …).
  private readonly unsubscribe_: Array<() => void> = [];
  // Per-animation trigger subscriptions, keyed so individual animations can be removed.
  private readonly animUnsubs_: Map<p4.KeyFrameAnimation, Array<() => void>> =
    new Map();

  constructor(options: {
    owner: p4.ElementViewOwner;
    target: HTMLElement;
    host: AnimationHost;
  }) {
    this.owner_ = options.owner;
    this.target_ = options.target;
    this.host_ = options.host;

    const presentation = options.owner.sectionViewOwner.presentationViewOwner;

    for (const anim of options.owner.animations.keyFrameAnimations) {
      this.addDriver_(anim);
    }

    this.unsubscribe_.push(
      presentation.events.on(
        "element:animationAdded",
        ({ element, animation }) => {
          if (element === this.owner_) this.addDriver_(animation);
        },
      ),
      presentation.events.on(
        "element:animationRemoved",
        ({ element, animation }) => {
          if (element === this.owner_) this.removeDriver_(animation);
        },
      ),
      presentation.events.on("animation:keyFramesChanged", ({ animation }) => {
        const driver = this.drivers_.get(animation);
        if (driver) driver.onKeyFramesChanged();
      }),
      // When the user reassigns an animation's trigger, tear down the old trigger
      // subscriptions for that animation and rebind to the new trigger. Without
      // this the driver would keep firing on the trigger that no longer owns it.
      presentation.events.on("animation:triggerChanged", ({ animation }) => {
        const driver = this.drivers_.get(animation);
        if (!driver) return;
        const old = this.animUnsubs_.get(animation);
        if (old) {
          for (const fn of old) fn();
          this.animUnsubs_.delete(animation);
        }
        this.bindTrigger_(animation, driver);
      }),
    );

    options.host.registerAnimationManager(this);
  }

  setEnabled(enabled: boolean): void {
    for (const driver of this.drivers_.values()) {
      driver.setEnabled(enabled);
    }
  }

  /** Redirect all drivers to a new DOM element (live element ↔ pin clone). */
  retarget(element: HTMLElement): void {
    this.target_ = element;
    for (const driver of this.drivers_.values()) {
      driver.retarget(element);
    }
  }

  layout(scale: number): void {
    this.scale_ = scale;
    for (const driver of this.drivers_.values()) {
      driver.onLayout(scale);
    }
  }

  destroy(): void {
    this.host_.unregisterAnimationManager(this);
    for (const fn of this.unsubscribe_) fn();
    this.unsubscribe_.length = 0;
    for (const unsubs of this.animUnsubs_.values()) {
      for (const fn of unsubs) fn();
    }
    this.animUnsubs_.clear();
    for (const driver of this.drivers_.values()) {
      driver.destroy();
    }
    this.drivers_.clear();
  }

  private addDriver_(animation: p4.KeyFrameAnimation): void {
    const driver = this.createDriver_(animation);
    if (!driver) return;
    this.drivers_.set(animation, driver);
    this.bindTrigger_(animation, driver);
  }

  private removeDriver_(animation: p4.KeyFrameAnimation): void {
    const driver = this.drivers_.get(animation);
    if (!driver) return;
    const unsubs = this.animUnsubs_.get(animation);
    if (unsubs) {
      for (const fn of unsubs) fn();
      this.animUnsubs_.delete(animation);
    }
    driver.destroy();
    this.drivers_.delete(animation);
  }

  private createDriver_(
    animation: p4.KeyFrameAnimation,
  ): AnimationDriver | null {
    if (animation.hasTarget) {
      // Sub-component SVG targeting: deferred pending ManualAnimationDriver
      // subclass implementation. The model tracks the animation; the view
      // will pick it up once a suitable driver exists.
      return null;
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
      scale: this.scale_,
    });
  }

  private bindTrigger_(
    animation: p4.KeyFrameAnimation,
    driver: AnimationDriver,
  ): void {
    const trigger = animation.trigger;
    this.animUnsubs_.set(animation, [
      trigger.on("start", ({ progress }) => {
        if (!this.host_.animationEnabled) return;
        driver.start(progress);
      }),
      trigger.on("scroll", ({ progress }) => {
        if (!this.host_.animationEnabled) return;
        driver.seek(progress);
      }),
      trigger.on("end", ({ progress }) => {
        if (!this.host_.animationEnabled) return;
        driver.end(progress);
      }),
      trigger.on("reverseStart", ({ progress }) => {
        if (!this.host_.animationEnabled) return;
        driver.reverseStart(progress);
      }),
      trigger.on("reverseEnd", ({ progress }) => {
        if (!this.host_.animationEnabled) return;
        driver.reverseEnd(progress);
      }),
    ]);
  }
}
