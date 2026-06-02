import { KeyFrameAnimation } from "../KeyFrameAnimation";
import { KeyFrame } from "../KeyFrame";
import { HTMLAnimationView } from "../../htmlView/HTMLAnimationView";
import { HTMLAnimationManager } from "../../htmlView/HTMLAnimationManager";

type CSSKeyFrame = {
  offset?: number;
  opacity?: number;
  backgroundPositionX?: string;
  backgroundPositionY?: string;
  strokeDashoffset?: number;
  transform?: string;
};

/**
 *
 * ## (?) Stroke tracing
 *
 * Animating the drawing of a stroke (stroke tracing) is explicitly supported by KeyFrameAnimation.
 * Most properties map directly to CSS properties, but stroke tracing requires translation because
 * we don't want the user to have to know about stroke dash arrays and offsets to use it.
 *
 * To that end:
 * - The `traceStroke` property is mapped to the `strokeDashoffset` CSS property.
 * - We store the path length
 * - We then use that length to set the `strokeDasharray` to the path length and calculate the
 *   `strokeDashoffset` based on the percentage specified in `traceStroke`.
 *
 * Important consequences:
 * - `traceStroke` only works on SVG path elements, and the path length must be able to be
 *   determined.
 * - If `traceStroke` is used, the `strokeDasharray` of the target element will be overridden to be
 *   the path length. (31/5/26: no current conflict but if we subsequently add support for animating
 *   stroke dash arrays this will need to be re-evaluated)
 */
export class HTMLKeyFrameAnimationView implements HTMLAnimationView {
  private readonly animation_: KeyFrameAnimation;
  private cssAnimation_!: Animation[];

  private readonly animationManager_: HTMLAnimationManager;

  // See stroke-tracing for details
  private pathLength_?: number;

  private readonly unsubscribe_: Array<() => void> = [];

  constructor(options: {
    animation: KeyFrameAnimation;
    animationManager: HTMLAnimationManager;
  }) {
    this.animation_ = options.animation;
    this.animationManager_ = options.animationManager;

    this.buildDOM();
    this.attachEventListeners();
  }

  disconnect(): void {
    this.unsubscribe_.forEach((unsubscribe) => unsubscribe());
    this.unsubscribe_.length = 0;
  }

  layout(): void {
    // FIXME: need to react to layout changes
  }

  animatableObjectModified(): void {
    this.buildDOM();
  }

  private buildDOM(): void {
    // Have to get path length before building keyframes, since keyframe building needs to know path
    // length if traceStroke is used
    this.animationManager_
      .getAnimationTargets(this.animation_)
      .find((target: Element): boolean => {
        if (target instanceof SVGPathElement) {
          this.pathLength_ = target.getTotalLength();
        }
        return true;
      });

    // Build CSS keyframes from our keyframes and a config object (which will be shared)
    //

    const cssKeyFrames: CSSKeyFrame[] = this.animation_.keyFrames.map(
      (keyFrame: KeyFrame) => this.buildKeyFrame(keyFrame),
    );

    const animationConfig: KeyframeAnimationOptions = {
      duration: this.animation_.duration,
      fill: "forwards",
      direction: "normal",
    };

    // Build the actual CSS Animations on the target elements, but keep them paused for now (we'll
    // drive them with the scroll trigger)
    //

    this.cssAnimation_ = this.animationManager_
      .getAnimationTargets(this.animation_)
      .map((target: Element): Animation => {
        // Special case for stroke tracing...
        // If the first keyframe has a strokeDashoffset property, we know this is a stroke tracing
        // animation (since that's the only way to get that property in the first place). In that
        // case, we need to set the strokeDasharray to the path length to set up the stroke tracing
        if (cssKeyFrames[0]!.strokeDashoffset !== undefined) {
          if (target instanceof SVGPathElement) {
            target.style.strokeDasharray = this.pathLength_!.toString();
          }
        }

        const animation = target.animate(cssKeyFrames, animationConfig);
        animation.pause();
        return animation;
      });
  }

  private buildKeyFrame(keyFrame: KeyFrame): CSSKeyFrame {
    const cssKeyFrame: CSSKeyFrame = {};

    if (keyFrame.opacity !== undefined) {
      cssKeyFrame.opacity = keyFrame.opacity;
    }

    if (keyFrame.backgroundPositionX !== undefined) {
      cssKeyFrame.backgroundPositionX = `${keyFrame.backgroundPositionX}%`;
    }

    if (keyFrame.backgroundPositionY !== undefined) {
      cssKeyFrame.backgroundPositionY = `${keyFrame.backgroundPositionY}%`;
    }

    if (keyFrame.position !== undefined) {
      cssKeyFrame.offset = keyFrame.position / this.animation_.duration;
    }

    if (keyFrame.traceStroke !== undefined) {
      if (this.pathLength_ !== undefined) {
        cssKeyFrame.strokeDashoffset =
          this.pathLength_ - (keyFrame.traceStroke * this.pathLength_) / 100;
      } else {
        // FIXME: need a better way to alert users this error.
        //
        // (subelement animations are difficult - most error handling is dealt with in xml/compuler
        //  layer - however, we don't parse SVG files at that point so can't validate the target
        //  element until we actually have an SVG to work with, by which point normal error
        //  reporting is gone)
        console.log(
          "WARNING: traceStroke is specified but the target element is not an SVGPathElement" +
          " or its path length cannot be determined.",
        );
      }
    }

    if (keyFrame.transform !== undefined) {
      cssKeyFrame.transform = keyFrame.transform;
    }

    return cssKeyFrame;
  }

  private attachEventListeners(): void {
    const scrollTrigger = this.animation_.scrollTrigger;

    this.unsubscribe_.push(
      scrollTrigger.on("start", () => {
        this.playAnimation("start");
      }),
      scrollTrigger.on("reverseStart", () => {
        this.playAnimation("end");
      }),
      scrollTrigger.on("end", () => {
        this.pauseAnimation("end");
        //this.playAnimation("end");
      }),
      scrollTrigger.on("reverseEnd", () => {
        this.pauseAnimation("start");
        //this.playAnimation("start");
      }),
      scrollTrigger.on("scroll", (e) => {
        this.driveAnimationToProgress(e.progress);
      }),
    );
  }

  private playAnimation(from: "start" | "end"): void {
    if (this.animation_.isScrollDriven == true) {
      return;
    }

    this.cssAnimation_.forEach((animation) => {
      if (from === "start") {
        animation.playbackRate = 1;
      } else {
        animation.playbackRate = -1;
      }

      animation.play();
    });
  }

  private pauseAnimation(at: "start" | "end"): void {
    this.cssAnimation_.forEach((animation) => {
      animation.pause();
      if (at === "start") {
        animation.currentTime = 0;
      } else {
        animation.currentTime = animation.effect!.getComputedTiming()
          .duration! as number;
      }
    });
  }

  private driveAnimationToProgress(progress: number): void {
    if (!this.animation_.isScrollDriven) {
      return;
    }

    this.cssAnimation_.forEach((animation) => {
      const duration = animation.effect!.getComputedTiming()
        .duration! as number;
      animation.currentTime = progress * duration;
    });
  }
}
