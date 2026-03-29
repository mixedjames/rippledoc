import { Animation as Presentation2Animation } from "../Animation";
import { KeyFrame } from "../KeyFrame";
import { HTMLElementView } from "../../../element/htmlView/HTMLElementView";

const STYLE_PRECISION = 2;

type CSSKeyFrame = {
  offset?: number;
  opacity?: number;
};

type AnimatableView = {
  get allForegroundHTMLElements(): HTMLElement[];
  get allBackgroundHTMLElements(): HTMLElement[];
};

/**
 *
 */
export class HTMLAnimationView {
  private readonly animation_: Presentation2Animation;
  private cssAnimation_!: Animation[];
  private readonly elementView_: HTMLElementView;

  private readonly unsubscribe_: Array<() => void> = [];

  constructor(options: {
    animation: Presentation2Animation;
    elementView: HTMLElementView;
  }) {
    this.animation_ = options.animation;
    this.elementView_ = options.elementView;

    this.buildDOM();
    this.attachEventListeners();
  }

  disconnect(): void {
    this.unsubscribe_.forEach((unsubscribe) => unsubscribe());
    this.unsubscribe_.length = 0;
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

    this.cssAnimation_ = [
      this.elementView_.htmlElement.animate(cssKeyFrames, animationConfig),
    ];
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
    const cssAnimation = this.cssAnimation_;

    this.unsubscribe_.push(
      scrollTrigger.on("start", () => {
        console.log("Animation start");
        this.playAnimation("start");
      }),
      scrollTrigger.on("reverseStart", () => {
        console.log("Animation reverse start");
        this.playAnimation("end");
      }),
      scrollTrigger.on("end", () => {
        console.log("Animation end");
        this.pauseAnimation("end");
      }),
      scrollTrigger.on("reverseEnd", () => {
        console.log("Animation reverse end");
        this.pauseAnimation("start");
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
