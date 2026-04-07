import { HTMLSectionView } from "../../section/htmlView/HTMLSectionView";
import { HTMLElementView } from "../../element/htmlView/HTMLElementView";
import { HTMLKeyFrameAnimationView } from "../keyFrameAnimation/htmlView/HTMLKeyFrameAnimationView";
import { ScrollTriggeredAnimation } from "../ScrollTriggeredAnimation";
import { HTMLPinView } from "../pin/htmlView/HTMLPinView";
import { Pin } from "../pin/Pin";
import { KeyFrameAnimation } from "../keyFrameAnimation/KeyFrameAnimation";
import { HTMLAnimationView } from "./HTMLAnimationView";

/**
 * Represents the browsers basic Element type.
 *
 * Exists because I made an error in naming elements on my custom DOM and we now have two different
 * Element types in this codebase - the browser's native Element, and our custom Element class.
 */
type DOMElement = globalThis.Element;

type HTMLAnimatableObject = HTMLSectionView | HTMLElementView;

/**
 * Coordinates pin and animation HTML views for a single "animatable" object
 * (either a Section or an Element).
 *
 * Intended usage
 * --------------
 * - Constructed by an owning view (currently HTMLElementView, and potentially
 *   HTMLSectionView in future) once the DOM for the animatable object exists.
 * - Owns HTMLPinView instances for any Pin models on the underlying Element.
 * - Owns HTMLAnimationView instances for each ScrollTriggeredAnimation
 *   attached to the underlying model.
 * - The owning view calls layout(), disconnect() and
 *   animatableObjectChanges() to keep the animation views in sync with the
 *   underlying DOM.
 *
 * Interaction with animations
 * ---------------------------
 * - During construction, reads pin and animation models from the parent
 *   (element.pins / element.animations, section.animations) and builds the
 *   corresponding HTMLPinView / HTMLAnimationView instances.
 * - getAnimationTargets() is used by HTMLAnimationView implementations to
 *   resolve which DOM elements a ScrollTriggeredAnimation should operate on:
 *   - For sections, animations apply to HTMLSectionView.htmlBackgroundElement
 *     and sections are never pinned.
 *   - For elements, animations target either the element's main htmlElement or
 *     a named sub-component, plus any pinned clones maintained by HTMLPinView.
 *
 * Coupling to sections and elements
 * ---------------------------------
 * This section describes the current state of coupling between HTMLAnimationManager and the
 * concrete view classes. It exists as a point for future James to refer back to
 * when thinking about refactoring.
 *
 * - The parent must currently be either HTMLSectionView or HTMLElementView
 *   (HTMLAnimatableObject).
 * - Only HTMLElementView instances can have pins; when the parent is a
 *   HTMLSectionView, getPinsFromParent() always returns an empty array.
 * - Both HTMLSectionView and HTMLElementView can have animations;
 *   section.animations are section-level, element.animations are
 *   element-level.
 * - HTMLAnimationManager is intentionally coupled to concrete view classes
 *   such as HTMLPinView and HTMLKeyFrameAnimationView; changes in the
 *   animation model surface will typically require coordinated updates here.
 */
export class HTMLAnimationManager {
  private parent_: HTMLSectionView | HTMLElementView;

  private readonly pinViews_: HTMLPinView[] = [];
  private readonly animationViews_: HTMLAnimationView[] = [];

  /**
   * Constructed by an owning view (Section/Element HTML view) once the underlying DOM is ready so
   * this manager can build and coordinate pin and animation views for that parent.
   */
  constructor(options: { parent: HTMLAnimatableObject }) {
    this.parent_ = options.parent;

    this.buildPins();
    this.buildAnimations();
  }

  /**
   * Rebuilds HTMLPinView instances for the current parent; only called internally by the
   * constructor (and potentially future reinitialisation paths) on this manager.
   */
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

  /**
   * Returns the Pin models for the current parent; used only by buildPins() to abstract over
   * Section vs Element parents.
   */
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

  /**
   * Rebuilds HTMLAnimationView instances from the parent's animation models; only called
   * internally by the constructor (and any future rebuild logic) on this manager.
   */
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

  /**
   * Returns the ScrollTriggeredAnimation models for the current parent; used only by
   * buildAnimations() to hide the Section vs Element branching.
   */
  private getAnimationsFromParent(): readonly ScrollTriggeredAnimation[] {
    if (this.parent_ instanceof HTMLSectionView) {
      // Section-level animations live on the underlying Section model.
      // Returning the array directly avoids the need for null checks in the
      // caller.
      return this.parent_.section.animations;
    } else if (this.parent_ instanceof HTMLElementView) {
      return this.parent_.element.animations;
    } else {
      throw new Error("Unsupported parent type for HTMLAnimationManager");
    }
  }

  /**
   * Called by the owning HTML view during layout or resize passes so managed pin and animation
   * views can recompute their DOM geometry.
   */
  layout(): void {
    this.pinViews_.forEach((pinView) => {
      pinView.layout();
    });

    this.animationViews_.forEach((animationView) => {
      animationView.layout();
    });
  }

  /**
   * Called by the owning HTML view when it is being detached or torn down so all managed pin and
   * animation views can release DOM references and event handlers.
   */
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
   * Called by an owning object (currently only HTMLElementView) to indicate that the DOM underlying
   * the animatable object has changed so pin and animation views can refresh their internal clones
   * and cached measurements.
   *
   * This is important because of pinned elements - pin views maintain a cloned version of the
   * original element's DOM, and if the original DOM changes then the clones need to be updated to
   * match.
   */
  animatableObjectChanges(): void {
    this.pinViews_.forEach((pinView) => {
      pinView.elementViewModified();
    });

    this.animationViews_.forEach((animationView) => {
      animationView.animatableObjectModified();
    });
  }

  /**
   * Used by HTMLAnimationView implementations to compute the concrete DOM Element targets for a
   * given ScrollTriggeredAnimation on this manager's parent.
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
  getAnimationTargets(animation: ScrollTriggeredAnimation): DOMElement[] {
    if (this.parent_ instanceof HTMLSectionView) {
      // (1) Path 1: Sections
      // These are easy because Sections are never pinned. The only complexity is that
      // HTMLSectionViews have a visual background element and a purely structural content element.
      // Animations only apply to the former.

      // Quick sanity check - Section animations cannot have sub-component targets, so if we see one
      // then something has gone very wrong upstream.
      if (animation.hasSubComponentTarget) {
        throw new Error(
          "Sub-component targets are not supported for Section animations",
        );
      }

      return [this.parent_.htmlBackgroundElement];
    } else if (this.parent_ instanceof HTMLElementView) {
      // (2) Path 2: Elements
      if (animation.hasSubComponentTarget) {
        // If the animation has a sub-component target, then we need to get the relevant sub-component
        // element from the parent, and all pinned clones of the parent.

        return [
          this.parent_.getSubComponentElement(animation.subComponentTarget),
          ...this.pinViews_.map((pinView) =>
            pinView.getSubComponentElement(animation.subComponentTarget),
          ),
        ];
      } else {
        // If there is no sub-component target, then the animation applies to the whole element
        // and all pinned clones of the element.

        return [
          this.parent_.htmlElement,
          ...this.pinViews_.map((pinView) => pinView.clonedElement),
        ];
      }
    } else {
      throw new Error("Unsupported parent type for HTMLAnimationManager");
    }
  }

  /**
   * Exposes the current animatable parent (Section or Element view) to callers such as animation
   * views that need to inspect higher-level context.
   */
  get animatableParent(): HTMLAnimatableObject {
    return this.parent_;
  }

  /**
   * Exposes the HTMLPinView instances managed for the current parent so owning views or tests can
   * inspect or iterate over active pins.
   */
  get pinViews(): readonly HTMLPinView[] {
    return this.pinViews_;
  }

  /**
   * Exposes the HTMLAnimationView instances managed for the current parent so owning views or
   * tests can observe which animations are active.
   */
  get animationViews(): readonly HTMLAnimationView[] {
    return this.animationViews_;
  }
}
