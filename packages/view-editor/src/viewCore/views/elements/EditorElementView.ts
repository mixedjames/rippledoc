import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "../EditorSectionView";
import { EditorPinManager } from "../EditorPinManager";
import { EditorAnimationManager } from "../animation/EditorAnimationManager";
import { fillToCss, borderToCss } from "../../utils/colorToCss";

/**
 * Base element view for the editor. Renders a single absolutely-positioned
 * outer div whose geometry is set from the element's global virtual-space
 * anchors on every layout pass.
 *
 * DOM structure inside the outer div:
 *   element_ (.element)           — position, border, overflow:hidden — always visible
 *     contentWrapper_ (.element-content) — all rendered content lives here
 *
 * Subclasses add type-specific content by appending to contentElement (the
 * contentWrapper_). The outer element_ is available for CSS class decoration
 * (e.g. "markdown-element") without affecting the content.
 *
 * Selection chrome: the "selected" class is toggled on element_ in response to
 * "selection:changed" events, and the "focused" class is toggled in response to
 * "focus:changed". The element view self-subscribes in its constructor and
 * self-unsubscribes in destroy(), so no external cascade is needed.
 *
 * Picking: pointerdown on element_ emits "element:picked" and "element:pointerDown"
 * through the controller, then focuses the viewport so subsequent key events route
 * through EditorPresentationView's keyboard listeners.
 */
export class EditorElementView implements p4.ElementView {
  private readonly owner_: p4.ElementViewOwner;
  private readonly sectionView_: EditorSectionView;
  private readonly element_: HTMLElement = document.createElement("div");
  private readonly contentWrapper_: HTMLElement = document.createElement("div");

  private computedStyle_: p4.ComputedElementStyle | null = null;
  private readonly pinManager_: EditorPinManager;
  private readonly animationManager_: EditorAnimationManager;
  private readonly onPointerDown_: (e: PointerEvent) => void;
  private readonly onPointerUp_: (e: PointerEvent) => void;
  private readonly unsubscribeSelection_: () => void;
  private readonly unsubscribeFocus_: () => void;
  private readonly unsubscribePinAdded_: () => void;
  private readonly unsubscribePinRemoved_: () => void;

  constructor(owner: p4.ElementViewOwner, parent: EditorSectionView) {
    this.owner_ = owner;
    this.sectionView_ = parent;

    const ctrl = parent.presentationView.controller;

    this.onPointerDown_ = (e: PointerEvent) => {
      parent.presentationView.dom.viewportContainer.focus({
        preventScroll: true,
      });
      ctrl.emit("element:picked", { element: this.owner_, source: e });
      ctrl.emit("element:pointerDown", { element: this.owner_, source: e });
    };

    this.onPointerUp_ = (e: PointerEvent) => {
      ctrl.emit("element:pointerUp", { element: this.owner_, source: e });
    };

    // Subscribe to selection changes for the lifetime of this element view.
    // Each view manages its own subscription rather than relying on an external
    // cascade, so elements added/removed at runtime are always in sync.
    this.unsubscribeSelection_ = ctrl.events.on(
      "selection:changed",
      ({ elements }) => {
        this.element_.classList.toggle("selected", elements.has(this.owner_));
      },
    );
    // Apply current selection state — the event won't fire retroactively.
    this.element_.classList.toggle(
      "selected",
      ctrl.selection.hasElement(this.owner_),
    );

    this.unsubscribeFocus_ = ctrl.events.on("focus:changed", (state) => {
      this.element_.classList.toggle(
        "focused",
        state.focused && state.element === this.owner_,
      );
    });
    const f = ctrl.selection.focus;
    this.element_.classList.toggle(
      "focused",
      f.focused && f.element === this.owner_,
    );

    this.initDOM_(parent);

    this.animationManager_ = new EditorAnimationManager({
      owner,
      target: this.element_,
      host: parent.presentationView,
    });

    this.pinManager_ = new EditorPinManager({
      elementDiv: this.element_,
      owner,
      presentationView: parent.presentationView,
      host: parent.presentationView,
      onRenderTargetChanged: (el) => this.animationManager_.retarget(el),
    });

    const pres = owner.sectionViewOwner.presentationViewOwner;
    this.unsubscribePinAdded_ = pres.events.on(
      "element:pinAdded",
      ({ element, pin }) => {
        if (element === this.owner_) this.pinManager_.addPin(pin);
      },
    );
    this.unsubscribePinRemoved_ = pres.events.on(
      "element:pinRemoved",
      ({ element, pin }) => {
        if (element === this.owner_) this.pinManager_.removePin(pin);
      },
    );
  }

  applyStyle(style: p4.ComputedElementStyle): void {
    this.computedStyle_ = style;
    this.applyStyles_();
  }

  layout({ scale }: p4.LayoutTransform): void {
    const anchors = this.owner_.anchors;
    this.element_.style.left = `${anchors.left.value * scale}px`;
    this.element_.style.top = `${anchors.top.value * scale}px`;
    this.element_.style.width = `${anchors.width.value * scale}px`;
    this.element_.style.height = `${anchors.height.value * scale}px`;
    this.applyStyles_();
    this.pinManager_.layout();
    this.animationManager_.layout(scale);
  }

  private applyStyles_(): void {
    const style = this.computedStyle_;
    if (!style) return;
    const scale =
      this.owner_.sectionViewOwner.presentationViewOwner.layoutTransform.scale;

    this.element_.style.background = fillToCss(style.fill);
    this.element_.style.border = borderToCss(style.border, scale);
    this.element_.style.borderRadius = `${style.borderRadius * scale}px`;
    this.element_.style.padding = `${style.padding * scale}px`;

    this.contentWrapper_.style.fontFamily = style.fontFamily;
    this.contentWrapper_.style.fontSize = `${style.fontSize * scale}px`;
    this.contentWrapper_.style.fontWeight = String(style.fontWeight);
    this.contentWrapper_.style.color = `rgba(${style.fontColor.r}, ${style.fontColor.g}, ${style.fontColor.b}, ${style.fontColor.a})`;
    this.contentWrapper_.style.fontStyle = style.fontItalic
      ? "italic"
      : "normal";
  }

  applyConstrainedDimension({ scale }: p4.LayoutTransform): void {
    const dim = this.owner_.contentDependentDimension;
    if (dim === "height") {
      this.element_.style.width = `${this.owner_.anchors.width.value * scale}px`;
      this.element_.style.height = "";
    } else if (dim === "width") {
      this.element_.style.height = `${this.owner_.anchors.height.value * scale}px`;
      this.element_.style.width = "";
    }
  }

  measureAndReport(): void {
    const dim = this.owner_.contentDependentDimension;
    if (dim === "none") return;
    const rect = this.element_.getBoundingClientRect();
    const scale =
      this.owner_.sectionViewOwner.presentationViewOwner.layoutTransform.scale;
    const size =
      dim === "height"
        ? scale > 0
          ? rect.height / scale
          : 0
        : scale > 0
          ? rect.width / scale
          : 0;
    this.owner_.notifyMeasuredSize(size);
  }

  destroy(): void {
    this.element_.removeEventListener("pointerdown", this.onPointerDown_);
    this.element_.removeEventListener("pointerup", this.onPointerUp_);
    this.unsubscribeSelection_();
    this.unsubscribeFocus_();
    this.unsubscribePinAdded_();
    this.unsubscribePinRemoved_();
    this.pinManager_.disconnect();
    this.animationManager_.destroy();
    this.element_.remove();
    this.sectionView_.onElementViewDestroyed(this);
  }

  /**
   * Call from subclasses when the element's DOM content changes asynchronously
   * (e.g. after an SVG finishes loading). Notifies the pin manager so it can
   * refresh its clone to reflect the new content.
   */
  protected notifyContentChanged(): void {
    this.pinManager_.onContentChanged();
  }

  protected get owner(): p4.ElementViewOwner {
    return this.owner_;
  }

  /** The outer positioning div. Use for CSS class decoration (type classes, etc.). */
  protected get element(): HTMLElement {
    return this.element_;
  }

  /** The inner content div. Subclasses add rendered content here. */
  protected get contentElement(): HTMLElement {
    return this.contentWrapper_;
  }

  private initDOM_(parent: EditorSectionView): void {
    this.element_.style.position = "absolute";
    this.element_.style.boxSizing = "border-box";
    this.element_.style.pointerEvents = "auto";
    this.element_.classList.add("element");

    this.contentWrapper_.classList.add("element-content");
    this.contentWrapper_.style.width = "100%";

    this.element_.appendChild(this.contentWrapper_);

    parent.contentContainer.appendChild(this.element_);

    this.element_.addEventListener("pointerdown", this.onPointerDown_);
    this.element_.addEventListener("pointerup", this.onPointerUp_);
  }
}
