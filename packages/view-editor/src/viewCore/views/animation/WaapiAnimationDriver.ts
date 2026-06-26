import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { AnimationDriver } from "./AnimationDriver";

/**
 * Convert one TransformStep to a CSS transform function string.
 * TranslateStep values are in basis units and are multiplied by scale.
 */
function stepToCSS(step: p4.TransformStep, scale: number): string {
  switch (step.type) {
    case "translate": {
      const x = (step.x ?? 0) * scale;
      const y = (step.y ?? 0) * scale;
      return `translate(${x}px, ${y}px)`;
    }
    case "rotate":
      return `rotate(${step.degrees}deg)`;
    case "scale":
      return step.x === step.y
        ? `scale(${step.x})`
        : `scale(${step.x}, ${step.y})`;
  }
}

/**
 * Build a WAAPI Keyframe array from the model's KeyFrame array.
 *
 * position (ms) is converted to offset (0–1 fraction of duration).
 * backgroundPositionX/Y and transform translate values are in basis units and
 * are scaled by the current LayoutTransform.scale so the animation tracks the
 * physical viewport size. traceStroke is omitted — ManualAnimationDriver handles it.
 */
function buildKeyframes(
  frames: readonly p4.KeyFrame[],
  duration: number,
  scale: number,
): Keyframe[] {
  return frames.map((f) => {
    const kf: Keyframe = { offset: f.position / duration };
    if (f.opacity !== undefined) kf.opacity = f.opacity;
    if (f.transform !== undefined)
      kf.transform = f.transform.map((s) => stepToCSS(s, scale)).join(" ");
    if (f.backgroundPositionX !== undefined)
      kf.backgroundPositionX = `${f.backgroundPositionX * scale}px`;
    if (f.backgroundPositionY !== undefined)
      kf.backgroundPositionY = `${f.backgroundPositionY * scale}px`;
    if (f.strokeDashoffset !== undefined)
      kf.strokeDashoffset = f.strokeDashoffset;
    return kf;
  });
}

/**
 * Animation driver that delegates to the Web Animations API.
 *
 * Handles all KeyFrame properties that map directly to CSS: opacity, transform,
 * backgroundPositionX, backgroundPositionY, strokeDashoffset. traceStroke is
 * silently skipped — it requires a ManualAnimationDriver subclass.
 *
 * Scroll-driven mode: the WAAPI animation is permanently paused; seek() sets
 * currentTime directly from trigger progress × duration.
 *
 * Time-based mode: play() / reverse() / finish() are called at trigger
 * boundary crossings; the browser drives the animation timeline independently.
 *
 * fill:'both' means the element holds the first keyframe before the animation
 * plays and the last keyframe after it finishes — the standard scrollytelling
 * convention (start hidden / off-screen, hold final state when done).
 *
 * Scale tracking: when onLayout(scale) reports a changed scale factor, keyframes
 * are rebuilt so basis-unit translate and backgroundPosition values map to the
 * correct physical pixels at the new viewport size.
 */
export class WaapiAnimationDriver implements AnimationDriver {
  private readonly animation_: p4.KeyFrameAnimation;
  private target_: Element;
  private waapi_: globalThis.Animation | null = null;
  private lastProgress_: number = 0;
  private scale_: number;

  constructor(
    animation: p4.KeyFrameAnimation,
    target: Element,
    { enabled, scale = 1 }: { enabled: boolean; scale?: number },
  ) {
    this.animation_ = animation;
    this.target_ = target;
    this.scale_ = scale;
    if (enabled) this.buildAnimation_();
  }

  start(progress: number): void {
    if (!this.waapi_) return;
    if (this.animation_.isScrollDriven) {
      this.seek(progress);
    } else {
      this.waapi_.playbackRate = 1;
      this.waapi_.play();
    }
  }

  seek(progress: number): void {
    if (!this.waapi_) return;
    this.lastProgress_ = progress;
    this.waapi_.currentTime = progress * this.animation_.duration;
  }

  end(): void {
    if (!this.waapi_) return;
    if (this.animation_.isScrollDriven) {
      this.seek(1);
    } else {
      // Snap to final state in case the animation didn't complete in time.
      this.waapi_.finish();
    }
  }

  reverseStart(progress: number): void {
    if (!this.waapi_) return;
    if (this.animation_.isScrollDriven) {
      this.seek(progress);
    } else {
      this.waapi_.reverse();
    }
  }

  reverseEnd(): void {
    if (!this.waapi_) return;
    if (this.animation_.isScrollDriven) {
      this.seek(0);
    } else {
      // Snap to initial state — the animation may still be reversing.
      this.waapi_.currentTime = 0;
      this.waapi_.pause();
    }
  }

  onLayout(scale: number): void {
    const scaleChanged = scale !== this.scale_;
    this.scale_ = scale;
    if (!this.waapi_) return;
    if (scaleChanged) {
      // Rebuild keyframes so basis-unit translations map to the new pixel size.
      const progress = this.lastProgress_;
      const playState = this.waapi_.playState;
      const playbackRate = this.waapi_.playbackRate;
      this.clearAnimation_();
      this.buildAnimation_();
      if (this.animation_.isScrollDriven) {
        this.waapi_.currentTime = progress * this.animation_.duration;
      } else {
        this.waapi_.currentTime = progress * this.animation_.duration;
        this.waapi_.playbackRate = playbackRate;
        if (playState === "running") this.waapi_.play();
      }
    } else if (this.animation_.isScrollDriven) {
      // Re-sync time to scroll position without rebuilding.
      this.waapi_.currentTime = this.lastProgress_ * this.animation_.duration;
    }
  }

  onKeyFramesChanged(): void {
    if (!this.waapi_) return;
    const progress = this.lastProgress_;
    this.clearAnimation_();
    this.buildAnimation_();
    if (this.animation_.isScrollDriven) {
      this.waapi_.currentTime = progress * this.animation_.duration;
    }
    // Time-based: rebuilt from start; re-entering the trigger zone replays it.
  }

  setEnabled(enabled: boolean): void {
    if (enabled) {
      if (!this.waapi_) this.buildAnimation_();
    } else {
      this.clearAnimation_();
    }
  }

  retarget(element: Element): void {
    if (!this.waapi_) {
      // Not enabled yet — just track the new target so buildAnimation_ uses it.
      this.target_ = element;
      return;
    }
    // Capture WAAPI state before clearAnimation_() discards the instance.
    const currentTime = this.waapi_.currentTime ?? 0;
    const playState = this.waapi_.playState;
    const playbackRate = this.waapi_.playbackRate;

    this.clearAnimation_();
    this.target_ = element;
    this.buildAnimation_(); // creates a fresh paused animation at t=0

    if (this.animation_.isScrollDriven) {
      // lastProgress_ is the authoritative position for scroll-driven; restore it.
      this.waapi_.currentTime = this.lastProgress_ * this.animation_.duration;
    } else {
      this.waapi_.currentTime = currentTime;
      this.waapi_.playbackRate = playbackRate;
      if (playState === "running") this.waapi_.play();
    }
  }

  destroy(): void {
    this.clearAnimation_();
  }

  private buildAnimation_(): void {
    const keyframes = buildKeyframes(
      this.animation_.keyFrames,
      this.animation_.duration,
      this.scale_,
    );
    this.waapi_ = this.target_.animate(keyframes, {
      duration: this.animation_.duration,
      fill: "both",
      iterations: 1,
    });
    this.waapi_.pause();
    this.waapi_.currentTime = 0;
  }

  private clearAnimation_(): void {
    if (this.waapi_) {
      this.waapi_.cancel();
      this.waapi_ = null;
    }
  }
}
