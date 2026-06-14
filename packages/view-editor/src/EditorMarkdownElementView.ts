import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "./EditorSectionView";
import { EditorElementView } from "./EditorElementView";
import { parseMarkdown } from "@rippledoc/markdown";

export class EditorMarkdownElementView extends EditorElementView {
  private readonly markdownOwner_: p4.MarkdownElementViewOwner;
  private readonly unsubscribeMarkdown_: () => void;

  constructor(owner: p4.MarkdownElementViewOwner, parent: EditorSectionView) {
    super(owner, parent);
    this.markdownOwner_ = owner;
    this.element.classList.add("markdown-element");
    this.element.style.overflow = "hidden";
    this.syncContent_();

    this.unsubscribeMarkdown_ =
      owner.sectionViewOwner.presentationViewOwner.events.on(
        "element:markdownChanged",
        ({ element }) => {
          if (element === owner) this.syncContent_();
        },
      );
  }

  override destroy(): void {
    this.unsubscribeMarkdown_();
    super.destroy();
  }

  private syncContent_(): void {
    this.element.replaceChildren(parseMarkdown(this.markdownOwner_.markdown));
  }
}
