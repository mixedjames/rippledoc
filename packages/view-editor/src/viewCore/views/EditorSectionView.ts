import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorPresentationView } from "./EditorPresentationView";
import { fillToCss, borderToCss } from "./colorToCss";
import { EditorMarkdownElementView } from "./EditorMarkdownElementView";
import { EditorBitmapImageElementView } from "./EditorBitmapImageElementView";
import { EditorSVGImageElementView } from "./EditorSVGImageElementView";
import type { EditorElementView } from "./EditorElementView";
import type { EditorViewControllerImpl } from "../EditorViewControllerImpl";

/**
 * Section view for the editor.
 *
 * Manages two DOM elements in the presentation's layered structure:
 *   backgroundElement_ — in the backgrounds layer; tracks the section's vertical
 *                        extent for background styling (borders, fills, etc.)
 *   contentElement_    — in the elements layer at (0, 0); a grouping node so that
 *                        removing a section also removes all its element views
 *
 * Elements are positioned in global virtual coordinates, so contentElement_ stays
 * at the origin and individual element views carry their own left/top offsets.
 *
 * elementViews_ is tracked so destroy() can cascade to element views in the
 * full-tree replacement path (where the model does not call elementView.destroy()).
 *
 * Pointer events on backgroundElement_ emit section:picked / section:pointerDown /
 * section:pointerUp through the controller, mirroring the element view pattern.
 * Because backgroundElement_ sits below elementsContainer in the DOM stack, a click
 * on an element never reaches the background — element picks always win.
 *
 * Selection chrome: the "selected" class is toggled on backgroundElement_ in
 * response to "selection:changed" events. The section view self-subscribes in
 * its constructor and self-unsubscribes in destroy().
 */
export class EditorSectionView implements p4.SectionView {
  private readonly owner_: p4.SectionViewOwner;
  private readonly presentationView_: EditorPresentationView;
  private readonly backgroundElement_: HTMLElement =
    document.createElement("div");
  private readonly contentElement_: HTMLElement = document.createElement("div");

  private readonly elementViews_: EditorElementView[] = [];
  private computedStyle_: p4.ComputedSectionStyle | null = null;

  private readonly onPointerDown_: (e: PointerEvent) => void;
  private readonly onPointerUp_: (e: PointerEvent) => void;
  private readonly unsubscribeSelection_: () => void;

  // Anchor handle type-label spans for the three vertical slots.
  private readonly anchorTypeLabels_: Map<string, HTMLElement> = new Map();

  constructor(owner: p4.SectionViewOwner, parent: EditorPresentationView) {
    this.owner_ = owner;
    this.presentationView_ = parent;

    const ctrl = parent.controller;

    this.onPointerDown_ = (e: PointerEvent) => {
      parent.dom.viewportContainer.focus({ preventScroll: true });
      // Selection is suppressed in anchors mode — picking is handled by anchor handles.
      if (parent.controller.mode === "anchors") return;
      ctrl.emit("section:picked", { section: this.owner_, source: e });
      ctrl.emit("section:pointerDown", { section: this.owner_, source: e });
    };

    this.onPointerUp_ = (e: PointerEvent) => {
      if (parent.controller.mode === "anchors") return;
      ctrl.emit("section:pointerUp", { section: this.owner_, source: e });
    };

    this.unsubscribeSelection_ = ctrl.events.on(
      "selection:changed",
      ({ sections }) => {
        this.backgroundElement_.classList.toggle(
          "selected",
          sections.has(this.owner_),
        );
      },
    );
    // Apply current selection state — the event won't fire retroactively.
    this.backgroundElement_.classList.toggle(
      "selected",
      ctrl.selection.hasSection(this.owner_),
    );

    this.initDOM_(parent);
  }

  applyStyle(style: p4.ComputedSectionStyle): void {
    this.computedStyle_ = style;
    this.applyStyles_();
  }

  layout({ scale }: p4.LayoutTransform): void {
    this.backgroundElement_.style.top = `${this.owner_.anchors.top.value * scale}px`;
    this.backgroundElement_.style.height = `${this.owner_.anchors.height.value * scale}px`;
    this.applyStyles_();
    this.refreshHandleLabels_();
  }

  private applyStyles_(): void {
    const style = this.computedStyle_;
    if (!style) return;
    const scale = this.owner_.presentationViewOwner.layoutTransform.scale;

    this.backgroundElement_.style.background = fillToCss(style.fill);
    this.backgroundElement_.style.border = borderToCss(style.border, scale);
  }

  createMarkdownElementView(
    owner: p4.MarkdownElementViewOwner,
  ): p4.ElementView {
    const ev = new EditorMarkdownElementView(owner, this);
    this.elementViews_.push(ev);
    return ev;
  }

  createBitmapImageElementView(
    owner: p4.BitmapImageElementViewOwner,
  ): p4.ElementView {
    const ev = new EditorBitmapImageElementView(owner, this);
    this.elementViews_.push(ev);
    return ev;
  }

  createSVGImageElementView(
    owner: p4.SVGImageElementViewOwner,
  ): p4.ElementView {
    const ev = new EditorSVGImageElementView(owner, this);
    this.elementViews_.push(ev);
    return ev;
  }

  // Called by EditorElementView.destroy() on single-node removal so the dead
  // view is not included in future destroy() cascades.
  onElementViewDestroyed(ev: EditorElementView): void {
    const i = this.elementViews_.indexOf(ev);
    if (i >= 0) this.elementViews_.splice(i, 1);
  }

  destroy(): void {
    this.backgroundElement_.removeEventListener(
      "pointerdown",
      this.onPointerDown_,
    );
    this.backgroundElement_.removeEventListener("pointerup", this.onPointerUp_);
    this.unsubscribeSelection_();

    // Full-tree cascade. Spread so that each ev.destroy() can safely call
    // onElementViewDestroyed() (mutating elementViews_) without corrupting iteration.
    for (const ev of [...this.elementViews_]) ev.destroy();
    this.backgroundElement_.remove();
    this.contentElement_.remove();
    this.presentationView_.onSectionViewDestroyed(this);
  }

  get contentContainer(): HTMLElement {
    return this.contentElement_;
  }

  get presentationView(): EditorPresentationView {
    return this.presentationView_;
  }

  private initDOM_(parent: EditorPresentationView): void {
    this.backgroundElement_.style.position = "absolute";
    this.backgroundElement_.style.boxSizing = "border-box";
    this.backgroundElement_.style.left = "0";
    this.backgroundElement_.style.width = "100%";
    this.backgroundElement_.classList.add("section-background");

    this.contentElement_.style.position = "absolute";
    this.contentElement_.style.left = "0";
    this.contentElement_.style.top = "0";
    this.contentElement_.classList.add("section-content");

    // Anchor handles for the three vertical slots. top is system-managed so it
    // gets the --system modifier (dimmed, non-interactive pointer style).
    const ctrl = parent.controller;
    this.appendAnchorHandle_(ctrl, { slot: "top", topPct: "0%", isSystem: true });
    this.appendAnchorHandle_(ctrl, { slot: "height", topPct: "50%", isSystem: false });
    this.appendAnchorHandle_(ctrl, { slot: "bottom", topPct: "100%", isSystem: false });

    this.backgroundElement_.addEventListener(
      "pointerdown",
      this.onPointerDown_,
    );
    this.backgroundElement_.addEventListener("pointerup", this.onPointerUp_);

    parent.dom.backgroundsContainer.appendChild(this.backgroundElement_);
    parent.dom.elementsContainer.appendChild(this.contentElement_);
  }

  /** Appends a vertical anchor handle to backgroundElement_. */
  private appendAnchorHandle_(
    ctrl: EditorViewControllerImpl,
    { slot, topPct, isSystem }: { slot: "top" | "height" | "bottom"; topPct: string; isSystem: boolean },
  ): void {
    const handle = document.createElement("div");
    handle.className =
      "anchor-handle" + (isSystem ? " anchor-handle--system" : "");
    handle.dataset.anchor = slot;
    // Position near the left edge, centred vertically at topPct.
    handle.style.top = topPct;
    handle.style.left = "8px";
    handle.style.transform = "translateY(-50%)";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = slot;

    const typeSpan = document.createElement("span");
    typeSpan.className = "anchor-handle__type";
    this.anchorTypeLabels_.set(slot, typeSpan);

    handle.appendChild(nameSpan);
    handle.appendChild(typeSpan);

    if (!isSystem) {
      handle.addEventListener("pointerdown", (e: PointerEvent) => {
        e.stopPropagation();
        const anchor = this.owner_.anchors[slot];
        ctrl.emit("anchor:picked", { anchor, source: e });
      });
    }

    this.backgroundElement_.appendChild(handle);
  }

  private refreshHandleLabels_(): void {
    const anchors = this.owner_.anchors;
    for (const [slot, span] of this.anchorTypeLabels_) {
      span.textContent = sectionExprTypeLabel(
        anchors[slot as "top" | "height" | "bottom"].expression,
      );
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Same dependency-count heuristic as EditorElementView — see note there.
function sectionExprTypeLabel(expr: p4.AnchorExpression): string {
  const n = expr.dependencies.length;
  if (n === 0) return "const";
  if (n === 1) return "ref";
  return "derived";
}
