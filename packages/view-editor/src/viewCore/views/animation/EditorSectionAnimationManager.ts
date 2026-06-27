import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { AnimationDriver } from "./AnimationDriver";
import { WaapiAnimationDriver } from "./WaapiAnimationDriver";
import { KeyFrameDriverPool } from "./KeyFrameDriverPool";

/**
 * What EditorSectionAnimationManager needs from the presentation view.
 */
interface SectionAnimationHost {
  readonly animationEnabled: boolean;
  registerSectionAnimationManager(manager: EditorSectionAnimationManager): void;
  unregisterSectionAnimationManager(
    manager: EditorSectionAnimationManager,
  ): void;
}

/**
 * Manages all keyframe animation drivers for a single section view.
 *
 * Mirrors EditorAnimationManager but handles section-specific concerns:
 *   - listens to section:animationAdded / section:animationRemoved
 *   - targets the section's backgroundElement (no pin clones, no retarget)
 *   - no sub-component targeting (sections cannot have SVG sub-components)
 *
 * Driver lifecycle, trigger subscriptions, and presentation-level animation
 * events are delegated to KeyFrameDriverPool.
 */
export class EditorSectionAnimationManager {
  private readonly owner_: p4.SectionViewOwner;
  private readonly target_: HTMLElement;
  private readonly host_: SectionAnimationHost;
  private readonly pool_: KeyFrameDriverPool;
  private readonly unsubscribe_: Array<() => void> = [];

  constructor(options: {
    owner: p4.SectionViewOwner;
    target: HTMLElement;
    host: SectionAnimationHost;
  }) {
    this.owner_ = options.owner;
    this.target_ = options.target;
    this.host_ = options.host;

    const presentation = options.owner.presentationViewOwner;

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
        "section:animationAdded",
        ({ section, animation }) => {
          if (section !== this.owner_) return;
          const driver = this.createDriver_(animation);
          if (driver) this.pool_.add(animation, driver);
        },
      ),
      presentation.events.on(
        "section:animationRemoved",
        ({ section, animation }) => {
          if (section !== this.owner_) return;
          this.pool_.remove(animation);
        },
      ),
    );

    options.host.registerSectionAnimationManager(this);
  }

  setEnabled(enabled: boolean): void {
    this.pool_.setEnabled(enabled);
  }

  layout(scale: number): void {
    this.pool_.layout(scale);
  }

  destroy(): void {
    this.host_.unregisterSectionAnimationManager(this);
    for (const fn of this.unsubscribe_) fn();
    this.unsubscribe_.length = 0;
    this.pool_.destroy();
  }

  private createDriver_(
    animation: p4.KeyFrameAnimation,
  ): AnimationDriver | null {
    // traceStroke requires a ManualAnimationDriver subclass not yet implemented.
    const needsManual = animation.keyFrames.some(
      (f) => f.traceStroke !== undefined,
    );
    if (needsManual) return null;
    return new WaapiAnimationDriver(animation, this.target_, {
      enabled: this.host_.animationEnabled,
      scale: this.pool_.scale,
    });
  }
}
