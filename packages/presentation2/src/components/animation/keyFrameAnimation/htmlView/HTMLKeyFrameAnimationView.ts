import { KeyFrameAnimation } from "../KeyFrameAnimation";
import { KeyFrame } from "../KeyFrame";
import { HTMLAnimationView } from "../../htmlView/HTMLAnimationView";
import { HTMLAnimationManager } from "../../htmlView/HTMLAnimationManager";

type CSSKeyFrame = {
  offset?: number;
  opacity?: number;
  backgroundPositionX?: string;
  backgroundPositionY?: string;
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
        animation.pause();
        return animation;
      },
    );
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

    console.log("Built CSS keyframe:", cssKeyFrame);
    return cssKeyFrame;
  }

  private attachEventListeners(): void {
    const scrollTrigger = this.animation_.scrollTrigger;

    this.unsubscribe_.push(
      scrollTrigger.on("start", () => {
        console.log("Playing animation forward");
        this.playAnimation("start");
      }),
      scrollTrigger.on("reverseStart", () => {
        this.playAnimation("end");
      }),
      scrollTrigger.on("end", () => {
        //this.pauseAnimation("end");
        this.playAnimation("end");
      }),
      scrollTrigger.on("reverseEnd", () => {
        //this.pauseAnimation("start");
        this.playAnimation("start");
      }),
      scrollTrigger.on("scroll", (e) => {
        this.driveAnimationToProgress(e.progress);
      }),
    );
  }

  private playAnimation(from: "start" | "end"): void {
    if (this.animation_.isScrollDriven) {
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
    if (this.animation_.isScrollDriven) {
      return;
    }

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
