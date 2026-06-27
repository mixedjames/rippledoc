import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { AnimationDriver } from "./AnimationDriver";

/**
 * Manages a collection of animation drivers for keyframe animations on a
 * single subject (element or section).
 *
 * Owns:
 *   - driver lifecycle: add(), remove() wire up the driver and bind its trigger
 *   - per-animation trigger subscriptions (start/scroll/end/reverseStart/reverseEnd)
 *   - presentation-level animation:keyFramesChanged / animation:triggerChanged subscriptions
 *     (these are not entity-specific — the pool filters by whether it owns the animation)
 *
 * The outer manager (EditorAnimationManager / EditorSectionAnimationManager) is
 * responsible for creating drivers and calling add() / remove() in response to
 * entity-specific events (element:animationAdded vs section:animationAdded).
 *
 * scale is stored so the outer manager can pass it to newly created drivers
 * without keeping a duplicate copy.
 */
export class KeyFrameDriverPool {
  private readonly drivers_: Map<p4.KeyFrameAnimation, AnimationDriver> =
    new Map();
  private readonly animUnsubs_: Map<p4.KeyFrameAnimation, Array<() => void>> =
    new Map();
  private readonly presentationUnsubs_: Array<() => void>;
  private readonly getEnabled_: () => boolean;
  private scale_: number = 1;

  constructor(events: p4.PresentationEventSource, getEnabled: () => boolean) {
    this.getEnabled_ = getEnabled;
    this.presentationUnsubs_ = [
      events.on("animation:keyFramesChanged", ({ animation }) => {
        const driver = this.drivers_.get(animation);
        if (driver) driver.onKeyFramesChanged();
      }),
      // When the user reassigns an animation's trigger, tear down the old
      // trigger subscriptions and rebind to the new trigger so the driver
      // fires on the correct one.
      events.on("animation:triggerChanged", ({ animation }) => {
        const driver = this.drivers_.get(animation);
        if (!driver) return;
        this.unbindTrigger_(animation);
        this.bindTrigger_(animation, driver);
      }),
    ];
  }

  /** Add a driver for an animation and start listening to its trigger. */
  add(animation: p4.KeyFrameAnimation, driver: AnimationDriver): void {
    this.drivers_.set(animation, driver);
    this.bindTrigger_(animation, driver);
  }

  /** Remove and destroy the driver for an animation. */
  remove(animation: p4.KeyFrameAnimation): void {
    const driver = this.drivers_.get(animation);
    if (!driver) return;
    this.unbindTrigger_(animation);
    driver.destroy();
    this.drivers_.delete(animation);
  }

  setEnabled(enabled: boolean): void {
    for (const driver of this.drivers_.values()) {
      driver.setEnabled(enabled);
    }
  }

  layout(scale: number): void {
    this.scale_ = scale;
    for (const driver of this.drivers_.values()) {
      driver.onLayout(scale);
    }
  }

  /** Transfer all drivers to a new render target (e.g. element ↔ pin clone). */
  retarget(target: HTMLElement): void {
    for (const driver of this.drivers_.values()) {
      driver.retarget(target);
    }
  }

  /** Current basis→pixel scale, for use when creating new drivers mid-session. */
  get scale(): number {
    return this.scale_;
  }

  destroy(): void {
    for (const fn of this.presentationUnsubs_) fn();
    // Spread so remove() can safely mutate drivers_ during iteration.
    for (const animation of [...this.drivers_.keys()]) {
      this.remove(animation);
    }
  }

  private bindTrigger_(
    animation: p4.KeyFrameAnimation,
    driver: AnimationDriver,
  ): void {
    const trigger = animation.trigger;
    this.animUnsubs_.set(animation, [
      trigger.on("start", ({ progress }) => {
        if (!this.getEnabled_()) return;
        driver.start(progress);
      }),
      trigger.on("scroll", ({ progress }) => {
        if (!this.getEnabled_()) return;
        driver.seek(progress);
      }),
      trigger.on("end", ({ progress }) => {
        if (!this.getEnabled_()) return;
        driver.end(progress);
      }),
      trigger.on("reverseStart", ({ progress }) => {
        if (!this.getEnabled_()) return;
        driver.reverseStart(progress);
      }),
      trigger.on("reverseEnd", ({ progress }) => {
        if (!this.getEnabled_()) return;
        driver.reverseEnd(progress);
      }),
    ]);
  }

  private unbindTrigger_(animation: p4.KeyFrameAnimation): void {
    const unsubs = this.animUnsubs_.get(animation);
    if (unsubs) {
      for (const fn of unsubs) fn();
      this.animUnsubs_.delete(animation);
    }
  }
}
