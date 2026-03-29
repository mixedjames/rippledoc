import { KeyFrameAnimation } from "../KeyFrameAnimation";
import { KeyFrame } from "../KeyFrame";
import { HTMLAnimationView } from "../../htmlView/HTMLAnimationView";
import { HTMLAnimationManager } from "../../htmlView/HTMLAnimationManager";

const STYLE_PRECISION = 2;

type CSSKeyFrame = {
  offset?: number;
  opacity?: number;
};

/**
 *
 */
export class HTMLKeyFrameAnimationView implements HTMLAnimationView {
  private readonly animation_: KeyFrameAnimation;
  private cssAnimation_!: Animation[];

  private readonly animationManager_: HTMLAnimationManager;

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

  private buildDOM(): void {
    const cssKeyFrames: CSSKeyFrame[] = this.animation_.keyFrames.map(
      (keyFrame: KeyFrame) => this.buildKeyFrame(keyFrame),
    );
    const animationConfig: KeyframeAnimationOptions = {
      duration: this.animation_.duration,
      fill: "forwards",
      direction: "normal",
    };

    this.cssAnimation_ = this.animationManager_.animationTargets.map(
      (target) => {
        const animation = target.animate(cssKeyFrames, animationConfig);
        return animation;
      },
    );

    this.pauseAnimation("start");
  }

  private buildKeyFrame(keyFrame: KeyFrame): CSSKeyFrame {
    const cssKeyFrame: CSSKeyFrame = {};

    if (keyFrame.opacity !== undefined) {
      cssKeyFrame.opacity = Number(keyFrame.opacity.toFixed(STYLE_PRECISION));
    }

    if (keyFrame.position !== undefined) {
      cssKeyFrame.offset = keyFrame.position / this.animation_.duration;
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
        //this.pauseAnimation("end");
      }),
      scrollTrigger.on("reverseEnd", () => {
        //this.pauseAnimation("start");
      }),
      scrollTrigger.on("scroll", (/*progress: number*/) => {
        //
      }),
    );
  }

  private playAnimation(from: "start" | "end"): void {
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
}
