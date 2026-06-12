import { parseMarkdown } from "@rippledoc/markdown";
import * as p3 from "../../document/viewModule";
import { V1SectionView } from "../section/V1SectionView";
import { V1ElementView } from "./V1ElementView";

/**
 * V1 markdown element view.
 *
 * Markdown source is owned by the model; parsing/rendering is delegated to the view layer.
 */
export class V1MarkdownElementView extends V1ElementView {
  private renderedMarkdown_: string | null = null;

  constructor(owner: p3.MarkdownElementViewOwner, parent: V1SectionView) {
    super(owner, parent);
    this.syncMarkdown();
    this.initDOM();
  }

  protected initDOM(): void {
    super.initDOM();
    this.htmlElement.classList.add("markdown-element");
    this.htmlElement.style.overflow = "hidden";
  }

  private syncMarkdown(): void {
    const markdown = this.markdownOwner.markdown;
    if (markdown === this.renderedMarkdown_) {
      return;
    }

    this.htmlElement.replaceChildren(parseMarkdown(markdown));
    this.renderedMarkdown_ = markdown;
  }

  override layout({ scale, tx }: { scale: number; tx: number }): void {
    this.syncMarkdown();
    super.layout({ scale, tx });
  }

  /**
   * Safe cast because construction only wires markdown owners into this subclass.
   */
  private get markdownOwner(): p3.MarkdownElementViewOwner {
    return this.owner as p3.MarkdownElementViewOwner;
  }
}
