import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { AnimationDriver } from "./AnimationDriver";

/**
 * Abstract base for animation drivers that compute and apply values
 * imperatively on every frame, rather than delegating to the Web Animations API.
 *
 * Provides the rAF loop for time-based playback and direct tick calls for
 * scroll-driven playback. Subclasses implement tick() (apply computed values
 * for a given t ∈ [0,1]) and clear() (remove all applied values).
 *
 * Planned first subclass: TraceStrokeDriver (converts traceStroke 0–100 to
 * strokeDashoffset using the SVG path's total length).
 *
 * Future candidates: PathFollowDriver, LookAtDriver, and any driver that needs
 * DOM measurements or value computation that WAAPI cannot express.
 */
export abstract class ManualAnimationDriver implements AnimationDriver {
  protected readonly animation_: p4.KeyFrameAnimation;
  private readonly boundOnRaf_: (now: number) => void;
  private rafId_: number | null = null;
  private startTime_: number = 0;
  private startT_: number = 0;
  private playingForward_: boolean = true;
  private currentT_: number = 0;
  private enabled_: boolean;

  constructor(animation: p4.KeyFrameAnimation, enabled: boolean) {
    this.animation_ = animation;
    this.enabled_ = enabled;
    this.boundOnRaf_ = this.onRaf_.bind(this);
  }

  /**
   * Apply computed values for normalized time t ∈ [0,1].
   *
   * Called on each rAF tick for time-based animations, or directly on each
   * relevant trigger event for scroll-driven animations. Subclasses interpolate
   * keyframe values and write them to the target DOM element or attribute.
   */
  protected abstract tick(t: number): void;

  /**
   * Remove all values applied by tick() and return the target to its natural
   * state. Called when animation is disabled (editor mode) or destroyed.
   */
  protected abstract clear(): void;

  start(progress: number): void {
    if (!this.enabled_) return;
    if (this.animation_.isScrollDriven) {
      this.currentT_ = progress;
      this.tick(progress);
    } else {
      this.startRaf_(0, true);
    }
  }

  seek(progress: number): void {
    if (!this.enabled_) return;
    this.currentT_ = progress;
    this.tick(progress);
  }

  end(): void {
    if (!this.enabled_) return;
    if (this.animation_.isScrollDriven) {
      this.currentT_ = 1;
      this.tick(1);
    } else {
      this.stopRaf_();
      this.currentT_ = 1;
      this.tick(1);
    }
  }

  reverseStart(progress: number): void {
    if (!this.enabled_) return;
    if (this.animation_.isScrollDriven) {
      this.currentT_ = progress;
      this.tick(progress);
    } else {
      this.startRaf_(this.currentT_, false);
    }
  }

  reverseEnd(): void {
    if (!this.enabled_) return;
    if (this.animation_.isScrollDriven) {
      this.currentT_ = 0;
      this.tick(0);
    } else {
      this.stopRaf_();
      this.currentT_ = 0;
      this.tick(0);
    }
  }

  onLayout(): void {
    if (!this.enabled_ || !this.animation_.isScrollDriven) return;
    this.tick(this.currentT_);
  }

  onKeyFramesChanged(): void {
    // Subclasses may cache derived values (e.g., SVG path length) that need
    // invalidation here. Re-applying currentT_ restores the visual state.
    if (this.enabled_) this.tick(this.currentT_);
  }

  setEnabled(enabled: boolean): void {
    this.enabled_ = enabled;
    if (!enabled) {
      this.stopRaf_();
      this.clear();
    }
  }

  destroy(): void {
    this.stopRaf_();
    this.clear();
  }

  private startRaf_(startT: number, forward: boolean): void {
    this.stopRaf_();
    this.startT_ = startT;
    this.playingForward_ = forward;
    this.startTime_ = performance.now();
    this.rafId_ = requestAnimationFrame(this.boundOnRaf_);
  }

  private stopRaf_(): void {
    if (this.rafId_ !== null) {
      cancelAnimationFrame(this.rafId_);
      this.rafId_ = null;
    }
  }

  private onRaf_(now: number): void {
    const elapsed = now - this.startTime_;
    const fraction = elapsed / this.animation_.duration;
    const delta = this.playingForward_ ? fraction : -fraction;
    const t = Math.max(0, Math.min(1, this.startT_ + delta));
    this.currentT_ = t;
    this.tick(t);

    const done = this.playingForward_ ? t >= 1 : t <= 0;
    if (done) {
      this.rafId_ = null;
    } else {
      this.rafId_ = requestAnimationFrame(this.boundOnRaf_);
    }
  }
}
