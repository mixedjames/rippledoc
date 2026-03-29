import { HTMLSectionView } from "../../section/htmlView/HTMLSectionView";
import { HTMLElementView } from "../../element/htmlView/HTMLElementView";
import { HTMLKeyFrameAnimationView } from "../keyFrameAnimation/htmlView/HTMLKeyFrameAnimationView";
import { ScrollTriggeredAnimation } from "../ScrollTriggeredAnimation";
import { HTMLPinView } from "../pin/htmlView/HTMLPinView";
import { Pin } from "../pin/Pin";
import { KeyFrameAnimation } from "../keyFrameAnimation/KeyFrameAnimation";
import { HTMLAnimationView } from "./HTMLAnimationView";

type HTMLAnimatableObject = HTMLSectionView | HTMLElementView;

export class HTMLAnimationManager {
  private parent_: HTMLSectionView | HTMLElementView;

  private readonly pinViews_: HTMLPinView[] = [];
  private readonly animationViews_: HTMLAnimationView[] = [];

  constructor(options: { parent: HTMLAnimatableObject }) {
    this.parent_ = options.parent;

    this.buildPins();
    this.buildAnimations();
  }

  private buildPins() {
    this.pinViews_.length = 0;

    const pins = this.getPinsFromParent();

    pins.forEach((pin) => {
      // We know that the parent must be an HTMLElementView if it has pins, so we can safely cast
      // here.
      this.pinViews_.push(
        new HTMLPinView({ pin, elementView: this.parent_ as HTMLElementView }),
      );
    });
  }

  private getPinsFromParent(): readonly Pin[] {
    if (this.parent_ instanceof HTMLSectionView) {
      // Sections themselves cannot be pinned - returning an empty array here to avoid the need for
      // null checks in the caller.
      return [];
    } else if (this.parent_ instanceof HTMLElementView) {
      return this.parent_.element.pins;
    } else {
      throw new Error("Unsupported parent type for HTMLAnimationManager");
    }
  }

  private buildAnimations() {
    const animationViews = this.animationViews_;

    animationViews.length = 0;

    const animations = this.getAnimationsFromParent();

    animations.forEach((animation) => {
      // FIXME: We need a better way to determine the type of animation here
      //        Possible some sort of typesafe visitor pattern on the ScrollTriggeredAnimation class?
      if (animation instanceof KeyFrameAnimation) {
        animationViews.push(
          new HTMLKeyFrameAnimationView({ animation, animationManager: this }),
        );
      } else {
        throw new Error("Unsupported animation type in HTMLAnimationManager");
      }
    });
  }

  private getAnimationsFromParent(): readonly ScrollTriggeredAnimation[] {
    if (this.parent_ instanceof HTMLSectionView) {
      // Sections themselves cannot be pinned - returning an empty array here to avoid the need for
      // null checks in the caller.
      return this.parent_.section.animations;
    } else if (this.parent_ instanceof HTMLElementView) {
      return this.parent_.element.animations;
    } else {
      throw new Error("Unsupported parent type for HTMLAnimationManager");
    }
  }

  layout(): void {
    this.pinViews_.forEach((pinView) => {
      pinView.layout();
    });

    this.animationViews_.forEach((animationView) => {
      animationView.layout();
    });
  }

  disconnect(): void {
    this.pinViews_.forEach((pinView) => {
      pinView.disconnect();
    });
    this.pinViews_.length = 0;

    this.animationViews_.forEach((animationView) => {
      animationView.disconnect();
    });
    this.animationViews_.length = 0;
  }

  /**
   * Gets the list of HTMLElements that should be targets for animations.
   *
   * This solves two problems:
   * 1. Sections vs Elements
   * 2. Pinned Elements
   *
   * Sections:
   * - Are never pinned
   * - Are animated via their background element, not their content element
   *
   * Elements:
   * - Can be pinned, in which case we need to animate the clone, and the original element
   * - Are animated via their content element
   */
  get animationTargets(): readonly HTMLElement[] {
    if (this.parent_ instanceof HTMLSectionView) {
      return [this.parent_.htmlBackgroundElement];
    }
    return [
      this.parent_.htmlElement,
      ...this.pinViews_.map((pinView) => pinView.clonedElement),
    ];
  }

  get animatableParent(): HTMLAnimatableObject {
    return this.parent_;
  }

  get pinViews(): readonly HTMLPinView[] {
    return this.pinViews_;
  }

  get animationViews(): readonly HTMLAnimationView[] {
    return this.animationViews_;
  }
}
