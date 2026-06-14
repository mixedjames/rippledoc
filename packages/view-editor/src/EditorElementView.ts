import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "./EditorSectionView";

/**
 * Base element view for the editor. Renders a single absolutely-positioned div
 * whose geometry is read from the element's global virtual-space anchors on
 * every layout pass.
 *
 * Subclasses add type-specific content rendering (markdown, bitmap, SVG) by
 * overriding initDOM() and layout().
 */
export class EditorElementView implements p4.ElementView {
  private readonly owner_: p4.ElementViewOwner;
  private readonly element_: HTMLElement = document.createElement("div");

  constructor(owner: p4.ElementViewOwner, parent: EditorSectionView) {
    this.owner_ = owner;
    this.initDOM_(parent);
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
    this.element_.remove();
  }

  protected get owner(): p4.ElementViewOwner {
    return this.owner_;
  }

  protected get element(): HTMLElement {
    return this.element_;
  }

  private initDOM_(parent: EditorSectionView): void {
    this.element_.style.position = "absolute";
    this.element_.style.boxSizing = "border-box";
    this.element_.classList.add("element");
    parent.contentContainer.appendChild(this.element_);
  }
}
