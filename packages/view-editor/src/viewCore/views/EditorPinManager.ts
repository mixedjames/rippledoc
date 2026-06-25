import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorPresentationView } from "./EditorPresentationView";

const STYLE_PRECISION = 2;

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
 *
 * Pins added after construction are wired dynamically via element:pinAdded.
 * Per-pin trigger subscriptions are tracked in pinUnsubs_ so individual pins
 * can be cleanly removed via element:pinRemoved.
 */
export class EditorPinManager {
  private readonly targetWrapper_: HTMLElement;
  private readonly owner_: p4.ElementViewOwner;
  private readonly presentationView_: EditorPresentationView;
  private readonly elementDiv_: HTMLElement;
  private readonly unsubscribe_: Array<() => void> = [];
  // Per-pin trigger subscriptions, keyed by pin for selective removal.
  private readonly pinUnsubs_: Map<p4.Pin, Array<() => void>> = new Map();
  // Notifies the animation manager to redirect drivers when pin state changes.
  private readonly onRenderTargetChanged_:
    | ((element: HTMLElement) => void)
    | undefined;

  // Mutable: replaced when content is re-cloned.
  private clone_: HTMLElement;

  /**
   * Cumulative basis-space offset from all pins whose end boundary has been
   * crossed (scrolling down). Does NOT include any in-progress pin.
   */
  private deltaY_: number = 0;

  // Non-null while a pin transition is active (clone visible, original hidden).
  private activePin_: p4.Pin | null = null;

  constructor(options: {
    elementDiv: HTMLElement;
    owner: p4.ElementViewOwner;
    presentationView: EditorPresentationView;
    onRenderTargetChanged?: (element: HTMLElement) => void;
  }) {
    this.elementDiv_ = options.elementDiv;
    this.owner_ = options.owner;
    this.presentationView_ = options.presentationView;
    this.onRenderTargetChanged_ = options.onRenderTargetChanged;

    this.targetWrapper_ = document.createElement("div");
    // Placeholder clone — content is re-cloned from the live element each time
    // pinning activates, because subclass constructors run after ours and add
    // content after this point.
    this.clone_ = document.createElement("div");

    this.buildDOM_();

    for (const pin of this.owner_.animations.pins) {
      this.addPin(pin);
    }

    // Keep the clone's "selected" and "focused" classes in sync with the
    // original while a pin is active. Stored in unsubscribe_ so disconnect()
    // cleans them up.
    const ctrl = this.presentationView_.controller;
    this.unsubscribe_.push(
      ctrl.events.on("selection:changed", ({ elements }) => {
        if (this.activePin_ !== null) {
          this.clone_.classList.toggle("selected", elements.has(this.owner_));
        }
      }),
      ctrl.events.on("focus:changed", (state) => {
        if (this.activePin_ !== null) {
          this.clone_.classList.toggle(
            "focused",
            state.focused && state.element === this.owner_,
          );
        }
      }),
    );
  }

  get hasPins(): boolean {
    return this.pinUnsubs_.size > 0;
  }

  layout(): void {
    if (this.activePin_ !== null) {
      // Clone is live — re-position it at the new scale.
      this.positionClone_(this.activePin_);
    } else {
      // Original is visible — deltaY_ is in basis-space, so multiplying by the
      // new scale gives the correct physical offset after a resize.
      const { scale } = this.layoutTransform_();
      const dy = scale * this.deltaY_;
      this.targetWrapper_.style.transform = `translateY(${dy.toFixed(STYLE_PRECISION)}px)`;
    }
  }

  /**
   * Called when the element's DOM content has changed asynchronously (e.g. SVG
   * finished loading). Re-clones the live element so the next pin activation
   * shows current content.
   */
  onContentChanged(): void {
    this.refreshClone_();
  }

  disconnect(): void {
    for (const fn of this.unsubscribe_) fn();
    this.unsubscribe_.length = 0;

    for (const unsubs of this.pinUnsubs_.values()) {
      for (const fn of unsubs) fn();
    }
    this.pinUnsubs_.clear();

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
    // Override the overlay's pointer-events:none so the clone is clickable.
    clone.style.pointerEvents = "auto";
    clone.classList.add("rdoc-pin-clone");
  }

  // ── Pin wiring ────────────────────────────────────────────────────────────

  addPin(pin: p4.Pin): void {
    const trigger = pin.trigger;
    const unsubs = [
      trigger.on("start", () => this.pinForward_(pin)),
      trigger.on("reverseStart", () => this.pinReverse_(pin)),
      trigger.on("end", () => this.unpinForward_(pin)),
      trigger.on("reverseEnd", () => this.unpinReverse_(pin)),
    ];
    this.pinUnsubs_.set(pin, unsubs);
  }

  removePin(pin: p4.Pin): void {
    const unsubs = this.pinUnsubs_.get(pin);
    if (!unsubs) return;
    for (const fn of unsubs) fn();
    this.pinUnsubs_.delete(pin);

    // If the removed pin was mid-transition, restore the original and reset delta.
    if (this.activePin_ === pin) {
      this.activePin_ = null;
      this.deltaY_ = 0;
      this.onRenderTargetChanged_?.(this.elementDiv_);
      this.showOriginal_();
      this.hideClone_();
      this.targetWrapper_.style.transform = "";
    }
  }

  // ── Pin state transitions ────────────────────────────────────────────────

  private pinForward_(pin: p4.Pin): void {
    this.activePin_ = pin;
    this.refreshClone_();
    // Redirect animation drivers to the clone before making it visible.
    this.onRenderTargetChanged_?.(this.clone_);
    this.positionClone_(pin);
    this.showClone_();
    this.hideOriginal_();
  }

  private pinReverse_(pin: p4.Pin): void {
    // Decrement before positioning: positionClone_ assumes deltaY_ excludes
    // the current pin's height, so we undo it first.
    this.deltaY_ -= pin.trigger.height;
    this.activePin_ = pin;
    this.refreshClone_();
    // Redirect animation drivers to the clone before making it visible.
    this.onRenderTargetChanged_?.(this.clone_);
    this.positionClone_(pin);
    this.showClone_();
    this.hideOriginal_();
  }

  private unpinForward_(pin: p4.Pin): void {
    // Translate the wrapper by the total accumulated offset including this pin.
    // Using the trigger's exact height (not current scroll position) avoids a
    // visible jump when the end boundary is crossed at high scroll speed.
    this.deltaY_ += pin.trigger.height;
    this.activePin_ = null;
    // Restore animation drivers to the original element before revealing it.
    this.onRenderTargetChanged_?.(this.elementDiv_);

    const { scale } = this.layoutTransform_();
    this.targetWrapper_.style.transform = `translateY(${(scale * this.deltaY_).toFixed(STYLE_PRECISION)}px)`;

    this.showOriginal_();
    this.hideClone_();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private unpinReverse_(_pin: p4.Pin): void {
    this.activePin_ = null;
    // Restore animation drivers to the original element before revealing it.
    this.onRenderTargetChanged_?.(this.elementDiv_);

    const { scale } = this.layoutTransform_();
    this.targetWrapper_.style.transform = `translateY(${(scale * this.deltaY_).toFixed(STYLE_PRECISION)}px)`;

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
    this.attachCloneInteraction_(fresh);
    this.clone_.replaceWith(fresh);
    this.clone_ = fresh;
  }

  /**
   * Attaches pointer event listeners to a freshly-created clone.
   *
   * The listeners close over `this` but the clone itself is not retained by
   * EditorPinManager after it is replaced — old clones become GC-eligible
   * along with their listeners, so no explicit removeEventListener is needed.
   */
  private attachCloneInteraction_(clone: HTMLElement): void {
    const ctrl = this.presentationView_.controller;
    clone.addEventListener("pointerdown", (e: PointerEvent) => {
      this.presentationView_.dom.viewportContainer.focus({
        preventScroll: true,
      });
      ctrl.emit("element:picked", { element: this.owner_, source: e });
      ctrl.emit("element:pointerDown", { element: this.owner_, source: e });
    });
    clone.addEventListener("pointerup", (e: PointerEvent) => {
      ctrl.emit("element:pointerUp", { element: this.owner_, source: e });
    });
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
