import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorPresentationView } from "./EditorPresentationView";
import { EditorMarkdownElementView } from "./EditorMarkdownElementView";
import { EditorBitmapImageElementView } from "./EditorBitmapImageElementView";
import { EditorSVGImageElementView } from "./EditorSVGImageElementView";

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
 */
export class EditorSectionView implements p4.SectionView {
  private readonly owner_: p4.SectionViewOwner;
  private readonly backgroundElement_: HTMLElement =
    document.createElement("div");
  private readonly contentElement_: HTMLElement = document.createElement("div");

  constructor(owner: p4.SectionViewOwner, parent: EditorPresentationView) {
    this.owner_ = owner;
    this.initDOM_(parent);
  }

  layout({ scale }: p4.LayoutTransform): void {
    this.backgroundElement_.style.top = `${this.owner_.anchors.top.value * scale}px`;
    this.backgroundElement_.style.height = `${this.owner_.anchors.height.value * scale}px`;
  }

  createMarkdownElementView(
    owner: p4.MarkdownElementViewOwner,
  ): p4.ElementView {
    return new EditorMarkdownElementView(owner, this);
  }

  createBitmapImageElementView(
    owner: p4.BitmapImageElementViewOwner,
  ): p4.ElementView {
    return new EditorBitmapImageElementView(owner, this);
  }

  createSVGImageElementView(
    owner: p4.SVGImageElementViewOwner,
  ): p4.ElementView {
    return new EditorSVGImageElementView(owner, this);
  }

  destroy(): void {
    this.backgroundElement_.remove();
    this.contentElement_.remove();
  }

  /** The container into which this section's element views append their DOM nodes. */
  get contentContainer(): HTMLElement {
    return this.contentElement_;
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
