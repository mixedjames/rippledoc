import { HTMLPresentationViewRoot } from "../../../presentation/htmlView/HTMLPresentationViewRoot";
import { Animation } from "../Animation";
import { HTMLAnimationView } from "../htmlView/HTMLAnimationView";
import { HTMLElementView } from "../../../element/htmlView/HTMLElementView";

type AnimationPair = {
  animation: Animation;
  elementView: HTMLElementView;
};

export class HTMLAnimationManager {
  private readonly htmlPresentationRoot_: HTMLPresentationViewRoot;
  private readonly cachedAnimations_: AnimationPair[] = [];
  private readonly animationViews_: HTMLAnimationView[] = [];

  constructor(options: { htmlPresentationRoot: HTMLPresentationViewRoot }) {
    this.htmlPresentationRoot_ = options.htmlPresentationRoot;

    this.buildAnimationCache();
    this.attachAnimationViews();
  }

  private buildAnimationCache(): void {
    this.cachedAnimations_.length = 0;

    // FIXME: We need a better way to collate animations from the presentation.
    this.htmlPresentationRoot_.sections.forEach((section) => {
      section.elementViews.forEach((elementView) => {
        elementView.element.animations.forEach((animation) => {
          this.cachedAnimations_.push({ animation, elementView });
        });
      });
    });
  }

  private attachAnimationViews(): void {
    this.cachedAnimations_.forEach(({ animation, elementView }) => {
      this.animationViews_.push(
        new HTMLAnimationView({ animation, elementView }),
      );
    });
  }
}
