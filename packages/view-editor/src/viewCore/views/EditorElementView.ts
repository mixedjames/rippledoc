import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "./EditorSectionView";
import { EditorPinManager, NullEditorPinManager } from "./EditorPinManager";
import { fillToCss, borderToCss } from "./colorToCss";
import type { EditorViewControllerImpl } from "../EditorViewControllerImpl";

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

  private computedStyle_: p4.ComputedElementStyle | null = null;
  private readonly pinManager_: EditorPinManager | NullEditorPinManager;
  private readonly onPointerDown_: (e: PointerEvent) => void;
  private readonly onPointerUp_: (e: PointerEvent) => void;
  private readonly unsubscribeSelection_: () => void;

  // Anchor handle type-label spans — refreshed each layout() so the displayed
  // expression type stays current after edits.
  private readonly anchorTypeLabels_: Map<string, HTMLElement> = new Map();

  constructor(owner: p4.ElementViewOwner, parent: EditorSectionView) {
    this.owner_ = owner;
    this.sectionView_ = parent;

    const ctrl = parent.presentationView.controller;

    this.onPointerDown_ = (e: PointerEvent) => {
      // Focus the viewport so keyboard events continue to fire after the click.
      parent.presentationView.dom.viewportContainer.focus({
        preventScroll: true,
      });
      // Selection is suppressed in anchors mode — picking is handled by anchor handles.
      if (parent.presentationView.controller.mode === "anchors") return;
      ctrl.emit("element:picked", { element: this.owner_, source: e });
      ctrl.emit("element:pointerDown", { element: this.owner_, source: e });
    };

    this.onPointerUp_ = (e: PointerEvent) => {
      if (parent.presentationView.controller.mode === "anchors") return;
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
    this.refreshHandleLabels_();
  }

  private applyStyles_(): void {
    const style = this.computedStyle_;
    if (!style) return;
    const scale =
      this.owner_.sectionViewOwner.presentationViewOwner.layoutTransform.scale;

    this.element_.style.background = fillToCss(style.fill);
    this.element_.style.border = borderToCss(style.border, scale);

    this.contentWrapper_.style.fontFamily = style.fontFamily;
    this.contentWrapper_.style.fontSize = `${style.fontSize * scale}px`;
    this.contentWrapper_.style.fontWeight = String(style.fontWeight);
    this.contentWrapper_.style.color = `rgba(${style.fontColor.r}, ${style.fontColor.g}, ${style.fontColor.b}, ${style.fontColor.a})`;
    this.contentWrapper_.style.fontStyle = style.fontItalic
      ? "italic"
      : "normal";
  }

  applyConstrainedDimension({ scale }: p4.LayoutTransform): void {
    // In anchors mode, element content is hidden (display:none on .element-content)
    // so the browser would size the element to zero. Bail out here — layout()
    // in Phase 4 will set the dimension explicitly from the anchor value, which
    // was correctly measured the last time editor mode ran.
    if (this.sectionView_.presentationView.controller.mode === "anchors")
      return;

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
    // In anchors mode, skip measurement — content is hidden and would read as
    // zero. Skipping also prevents notifyMeasuredSize from emitting
    // "anchors:changed" on every frame, which would otherwise create a
    // perpetual layout loop.
    if (this.sectionView_.presentationView.controller.mode === "anchors")
      return;

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
    // Opt back into pointer events — the parent elements layer has none.
    this.element_.style.pointerEvents = "auto";
    this.element_.classList.add("element");

    this.contentWrapper_.classList.add("element-content");
    this.contentWrapper_.style.width = "100%";

    this.element_.appendChild(this.contentWrapper_);

    // Anchor handles — appended after content wrapper so they sit on top.
    // Two-column layout: positional anchors on the left, size anchors on the right.
    //   left column  → top (top-left), left (mid-left), bottom (bottom-left)
    //   right column → width (top-right), right (mid-right), height (bottom-right)
    const ctrl = parent.presentationView.controller;
    this.appendAnchorHandle_(ctrl, "top", { top: "4px", left: "4px" });
    this.appendAnchorHandle_(ctrl, "left", {
      top: "50%",
      left: "4px",
      transform: "translateY(-50%)",
    });
    this.appendAnchorHandle_(ctrl, "bottom", { bottom: "4px", left: "4px" });
    this.appendAnchorHandle_(ctrl, "width", { top: "4px", right: "4px" });
    this.appendAnchorHandle_(ctrl, "right", {
      top: "50%",
      right: "4px",
      transform: "translateY(-50%)",
    });
    this.appendAnchorHandle_(ctrl, "height", { bottom: "4px", right: "4px" });

    parent.contentContainer.appendChild(this.element_);

    this.element_.addEventListener("pointerdown", this.onPointerDown_);
    this.element_.addEventListener("pointerup", this.onPointerUp_);
  }

  private appendAnchorHandle_(
    ctrl: EditorViewControllerImpl,
    slot: string,
    pos: {
      top?: string;
      left?: string;
      right?: string;
      bottom?: string;
      transform?: string;
    },
  ): void {
    const handle = document.createElement("div");
    handle.className = "anchor-handle";
    handle.dataset.anchor = slot;
    if (pos.top !== undefined) handle.style.top = pos.top;
    if (pos.left !== undefined) handle.style.left = pos.left;
    if (pos.right !== undefined) handle.style.right = pos.right;
    if (pos.bottom !== undefined) handle.style.bottom = pos.bottom;
    if (pos.transform !== undefined) handle.style.transform = pos.transform;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = slot;

    const typeSpan = document.createElement("span");
    typeSpan.className = "anchor-handle__type";
    this.anchorTypeLabels_.set(slot, typeSpan);

    handle.appendChild(nameSpan);
    handle.appendChild(typeSpan);

    handle.addEventListener("pointerdown", (e: PointerEvent) => {
      e.stopPropagation();
      // Keep viewport focused so keyboard events continue to work.
      this.sectionView_.presentationView.dom.viewportContainer.focus({
        preventScroll: true,
      });
      const anchor = this.owner_.anchors[slot as keyof p4.XYAnchors];
      ctrl.emit("anchor:picked", { anchor, source: e });
    });

    this.element_.appendChild(handle);
  }

  private refreshHandleLabels_(): void {
    const anchors = this.owner_.anchors;
    for (const [slot, span] of this.anchorTypeLabels_) {
      span.textContent = exprTypeLabel(
        anchors[slot as keyof p4.XYAnchors].expression,
      );
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// view-editor imports only from viewAPI, which does not export the concrete
// expression classes. The label is inferred from dependency count — this is not
// formally contractual but matches the current expression hierarchy:
//   0 deps → ConstantAnchorExpression  → "const"
//   1 dep  → Offset/FractionExpression → "ref"
//   2 deps → DerivedAnchorExpression   → "derived"
function exprTypeLabel(expr: p4.AnchorExpression): string {
  const n = expr.dependencies.length;
  if (n === 0) return "const";
  if (n === 1) return "ref";
  return "derived";
}
