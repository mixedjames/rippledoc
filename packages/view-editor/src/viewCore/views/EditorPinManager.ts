import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorPresentationView } from "./EditorPresentationView";

const STYLE_PRECISION = 2;

/**
 * No-op pin manager for elements that have no pins. Avoids null checks at call
 * sites while adding zero overhead for the common unpinned case.
 */
export class NullEditorPinManager {
  get hasPins(): boolean {
    return false;
  }

  layout(): void {}

  onContentChanged(): void {}

  disconnect(): void {}
}

/**
 * Implements the non-scrolling-overlay clone technique ported from presentation2.
 *
 * The viewport scrolls; the overlay/pins container does not. By placing a clone
 * of the element in the non-scrolling pins layer we make the element appear to
 * "stick" on screen without using position:fixed or transforms on the element.
 *
 * State machine per pin (four trigger events):
 *   start        → pinForward:   clone shown, original hidden
 *   end          → unpinForward: original restored + translateY; deltaY grows
 *   reverseStart → pinReverse:   deltaY decremented, clone shown, original hidden
 *   reverseEnd   → unpinReverse: original restored with pre-pin deltaY
 *
 * deltaY_ tracks basis-space scroll distance consumed by completed pins so
 * that subsequent pins are positioned correctly.
 */
export class EditorPinManager {
  private readonly targetWrapper_: HTMLElement;
  private readonly owner_: p4.ElementViewOwner;
  private readonly presentationView_: EditorPresentationView;
  private readonly elementDiv_: HTMLElement;
  private readonly unsubscribe_: Array<() => void> = [];

  // Mutable: replaced when content is re-cloned.
  private clone_: HTMLElement;

  /**
   * Cumulative basis-space offset from all pins whose end boundary has been
   * crossed (scrolling down). Does NOT include any in-progress pin.
   */
  private deltaY_: number = 0;

  constructor(options: {
    elementDiv: HTMLElement;
    owner: p4.ElementViewOwner;
    presentationView: EditorPresentationView;
  }) {
    this.elementDiv_ = options.elementDiv;
    this.owner_ = options.owner;
    this.presentationView_ = options.presentationView;

    this.targetWrapper_ = document.createElement("div");
    // Placeholder clone — content is re-cloned from the live element each time
    // pinning activates, because subclass constructors run after ours and add
    // content after this point.
    this.clone_ = document.createElement("div");

    this.buildDOM_();
    this.buildPins_();
  }

  get hasPins(): boolean {
    return true;
  }

  layout(): void {}

  /**
   * Called when the element's DOM content has changed asynchronously (e.g. SVG
   * finished loading). Re-clones the live element so the next pin activation
   * shows current content.
   */
  onContentChanged(): void {
    this.refreshClone_();
  }

  disconnect(): void {
    this.unsubscribe_.forEach((fn) => fn());
    this.unsubscribe_.length = 0;

    // Unwrap: replace the wrapper with the original element div.
    this.targetWrapper_.replaceWith(this.elementDiv_);
    this.elementDiv_.style.visibility = "";

    this.clone_.remove();
  }

  // ── DOM setup ────────────────────────────────────────────────────────────

  private buildDOM_(): void {
    // The wrapper sits at 0,0 in the section content container and receives
    // translateY after each pin completes. The element inside keeps its own
    // absolute geometry unchanged.
    this.targetWrapper_.style.position = "absolute";
    this.targetWrapper_.style.top = "0";
    this.targetWrapper_.style.left = "0";
    this.targetWrapper_.classList.add("rdoc-pin-wrapper");

    this.elementDiv_.replaceWith(this.targetWrapper_);
    this.targetWrapper_.appendChild(this.elementDiv_);

    this.initCloneStyles_(this.clone_);
    this.presentationView_.pinsContainer.appendChild(this.clone_);
  }

  private initCloneStyles_(clone: HTMLElement): void {
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.classList.add("rdoc-pin-clone");
  }

  // ── Trigger subscriptions ────────────────────────────────────────────────

  private buildPins_(): void {
    for (const pin of this.owner_.animations.pins) {
      const trigger = pin.trigger;
      this.unsubscribe_.push(
        trigger.on("start", () => this.pinForward_(pin)),
        trigger.on("reverseStart", () => this.pinReverse_(pin)),
        trigger.on("end", () => this.unpinForward_(pin)),
        trigger.on("reverseEnd", () => this.unpinReverse_(pin)),
      );
    }
  }

  // ── Pin state transitions ────────────────────────────────────────────────

  private pinForward_(pin: p4.Pin): void {
    this.refreshClone_();
    this.positionClone_(pin);
    this.showClone_();
    this.hideOriginal_();
  }

  private pinReverse_(pin: p4.Pin): void {
    // Decrement before positioning: positionClone_ assumes deltaY_ excludes
    // the current pin's height, so we undo it first.
    this.deltaY_ -= pin.trigger.height;
    this.refreshClone_();
    this.positionClone_(pin);
    this.showClone_();
    this.hideOriginal_();
  }

  private unpinForward_(pin: p4.Pin): void {
    // Translate the wrapper by the total accumulated offset including this pin.
    // Using the trigger's exact height (not current scroll position) avoids a
    // visible jump when the end boundary is crossed at high scroll speed.
    const { scale } = this.layoutTransform_();
    const dy = scale * (this.deltaY_ + pin.trigger.height);
    this.targetWrapper_.style.transform = `translateY(${dy.toFixed(STYLE_PRECISION)}px)`;

    this.showOriginal_();
    this.hideClone_();

    this.deltaY_ += pin.trigger.height;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private unpinReverse_(_pin: p4.Pin): void {
    const { scale } = this.layoutTransform_();
    const dy = scale * this.deltaY_;
    this.targetWrapper_.style.transform = `translateY(${dy.toFixed(STYLE_PRECISION)}px)`;

    this.showOriginal_();
    this.hideClone_();
  }

  // ── Clone positioning ────────────────────────────────────────────────────

  /**
   * Positions the clone so it appears exactly where the element would sit on
   * screen at the moment pinning begins.
   *
   * The clone lives in the non-scrolling pins overlay, so coordinates are in
   * physical pixels relative to the shadow root, not the scrollable viewport.
   * tx accounts for horizontal centering of the presentation in the viewport.
   *
   * Invariant: deltaY_ must NOT include the current pin's height when this
   * is called. Both pinForward_ and pinReverse_ enforce this.
   */
  private positionClone_(pin: p4.Pin): void {
    const { scale, tx } = this.layoutTransform_();
    const anchors = this.owner_.anchors;

    const left = anchors.left.value * scale + tx;
    const top = (this.deltaY_ + anchors.top.value - pin.trigger.top) * scale;
    const width = anchors.width.value * scale;
    const height = anchors.height.value * scale;

    this.clone_.style.left = `${left.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.top = `${top.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.width = `${width.toFixed(STYLE_PRECISION)}px`;
    this.clone_.style.height = `${height.toFixed(STYLE_PRECISION)}px`;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private refreshClone_(): void {
    const fresh = this.elementDiv_.cloneNode(true) as HTMLElement;
    this.initCloneStyles_(fresh);
    this.clone_.replaceWith(fresh);
    this.clone_ = fresh;
  }

  private layoutTransform_(): p4.LayoutTransform {
    return this.owner_.sectionViewOwner.presentationViewOwner.layoutTransform;
  }

  private showClone_(): void {
    this.clone_.style.visibility = "visible";
  }

  private hideClone_(): void {
    this.clone_.style.visibility = "hidden";
  }

  private showOriginal_(): void {
    this.elementDiv_.style.visibility = "";
  }

  private hideOriginal_(): void {
    this.elementDiv_.style.visibility = "hidden";
  }
}
