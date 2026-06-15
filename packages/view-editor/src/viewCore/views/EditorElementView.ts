import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "./EditorSectionView";
import { EditorPinManager, NullEditorPinManager } from "./EditorPinManager";

/**
 * Base element view for the editor. Renders a single absolutely-positioned
 * outer div whose geometry is set from the element's global virtual-space
 * anchors on every layout pass.
 *
 * DOM structure inside the outer div:
 *   element_ (.element)           — position, border, overflow:hidden — always visible
 *     contentWrapper_ (.element-content) — all rendered content lives here;
 *                                          hidden in anchors mode via CSS data-mode rule
 *
 * Subclasses add type-specific content by appending to contentElement (the
 * contentWrapper_). The outer element_ is available for CSS class decoration
 * (e.g. "markdown-element") without affecting the content hiding mechanism.
 *
 * Selection chrome: the "selected" class is toggled on element_ in response to
 * "selection:changed" events. The element view self-subscribes in its constructor
 * and self-unsubscribes in destroy(), so no external cascade is needed.
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

  private readonly pinManager_: EditorPinManager | NullEditorPinManager;
  private readonly onPointerDown_: (e: PointerEvent) => void;
  private readonly onPointerUp_: (e: PointerEvent) => void;
  private readonly unsubscribeSelection_: () => void;

  constructor(owner: p4.ElementViewOwner, parent: EditorSectionView) {
    this.owner_ = owner;
    this.sectionView_ = parent;

    const ctrl = parent.presentationView.controller;

    this.onPointerDown_ = (e: PointerEvent) => {
      // Focus the viewport so keyboard events continue to fire after the click.
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
      ({ selection }) => {
        this.element_.classList.toggle("selected", selection.has(this.owner_));
      },
    );
    // Apply current selection state — the event won't fire retroactively.
    this.element_.classList.toggle(
      "selected",
      ctrl.selection.has(this.owner_),
    );

    this.initDOM_(parent);

    this.pinManager_ =
      owner.animations.pins.length > 0
        ? new EditorPinManager({
            elementDiv: this.element_,
            owner,
            presentationView: parent.presentationView,
          })
        : new NullEditorPinManager();
  }

  layout({ scale }: p4.LayoutTransform): void {
    const anchors = this.owner_.anchors;
    this.element_.style.left = `${anchors.left.value * scale}px`;
    this.element_.style.top = `${anchors.top.value * scale}px`;
    this.element_.style.width = `${anchors.width.value * scale}px`;
    this.element_.style.height = `${anchors.height.value * scale}px`;
  }

  applyConstrainedDimension({ scale }: p4.LayoutTransform): void {
    const dim = this.owner_.contentDependentDimension;
    if (dim === "height") {
      // Fix width so content can reflow; clear height so the browser sizes it naturally.
      this.element_.style.width = `${this.owner_.anchors.width.value * scale}px`;
      this.element_.style.height = "";
    } else if (dim === "width") {
      // Fix height; clear width.
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
    this.pinManager_.disconnect();
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
    this.element_.classList.add("element");

    this.contentWrapper_.classList.add("element-content");
    this.contentWrapper_.style.width = "100%";

    this.element_.appendChild(this.contentWrapper_);
    parent.contentContainer.appendChild(this.element_);

    this.element_.addEventListener("pointerdown", this.onPointerDown_);
    this.element_.addEventListener("pointerup", this.onPointerUp_);
  }
}
