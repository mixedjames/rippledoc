import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "./EditorSectionView";
import { EditorElementView } from "./EditorElementView";

export class EditorMarkdownElementView extends EditorElementView {
  private readonly owner_: p4.MarkdownElementViewOwner;

  constructor(owner: p4.MarkdownElementViewOwner, parent: EditorSectionView) {
    super(owner, parent);
    this.owner_ = owner;
    this.element.classList.add("markdown-element");
    this.element.style.overflow = "hidden";
    this.syncContent_();
  }

  override layout(transform: p4.LayoutTransform): void {
    this.syncContent_();
    super.layout(transform);
  }

  private syncContent_(): void {
    this.element.textContent = this.owner_.markdown;
  }
}
