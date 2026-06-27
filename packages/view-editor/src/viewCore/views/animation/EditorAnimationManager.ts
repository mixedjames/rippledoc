import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { AnimationDriver } from "./AnimationDriver";
import { WaapiAnimationDriver } from "./WaapiAnimationDriver";
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
 * Deferred driver types (not yet implemented):
 *   - Sub-component targeting (animation.hasTarget) — skipped for now
 *   - ManualAnimationDriver subclasses (traceStroke) — skipped for now
 */
export class EditorAnimationManager {
  private readonly owner_: p4.ElementViewOwner;
  private target_: HTMLElement;
  private readonly host_: AnimationHost;
  private readonly pool_: KeyFrameDriverPool;
  private readonly unsubscribe_: Array<() => void> = [];

  constructor(options: {
    owner: p4.ElementViewOwner;
    target: HTMLElement;
    host: AnimationHost;
  }) {
    this.owner_ = options.owner;
    this.target_ = options.target;
    this.host_ = options.host;

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
          this.pool_.remove(animation);
        },
      ),
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

  destroy(): void {
    this.host_.unregisterAnimationManager(this);
    for (const fn of this.unsubscribe_) fn();
    this.unsubscribe_.length = 0;
    this.pool_.destroy();
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
      scale: this.pool_.scale,
    });
  }
}
