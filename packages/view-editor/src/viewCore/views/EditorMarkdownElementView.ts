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
    // CSS class on the outer element for type-specific styling (font, padding).
    this.element.classList.add("markdown-element");
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
    // Render into the content wrapper so anchors mode can hide it without
    // hiding the element's outer box (border, position).
    this.contentElement.replaceChildren(
      parseMarkdown(this.markdownOwner_.markdown),
    );
    // If the height is content-dependent, the new content may change the natural
    // height. Request a layout pass so the measurement phase re-runs.
    if (this.markdownOwner_.contentDependentDimension === "height") {
      this.markdownOwner_.sectionViewOwner.presentationViewOwner.requestLayout();
    }
  }
}
