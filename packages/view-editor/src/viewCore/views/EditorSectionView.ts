import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorPresentationView } from "./EditorPresentationView";
import { EditorMarkdownElementView } from "./EditorMarkdownElementView";
import { EditorBitmapImageElementView } from "./EditorBitmapImageElementView";
import { EditorSVGImageElementView } from "./EditorSVGImageElementView";
import type { EditorElementView } from "./EditorElementView";

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
 */
export class EditorSectionView implements p4.SectionView {
  private readonly owner_: p4.SectionViewOwner;
  private readonly presentationView_: EditorPresentationView;
  private readonly backgroundElement_: HTMLElement =
    document.createElement("div");
  private readonly contentElement_: HTMLElement = document.createElement("div");

  private readonly elementViews_: EditorElementView[] = [];

  constructor(owner: p4.SectionViewOwner, parent: EditorPresentationView) {
    this.owner_ = owner;
    this.presentationView_ = parent;
    this.initDOM_(parent);
  }

  layout({ scale }: p4.LayoutTransform): void {
    this.backgroundElement_.style.top = `${this.owner_.anchors.top.value * scale}px`;
    this.backgroundElement_.style.height = `${this.owner_.anchors.height.value * scale}px`;
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

    parent.dom.backgroundsContainer.appendChild(this.backgroundElement_);
    parent.dom.elementsContainer.appendChild(this.contentElement_);
  }
}
