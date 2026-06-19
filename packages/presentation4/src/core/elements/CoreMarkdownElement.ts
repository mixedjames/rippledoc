import type { MarkdownElement } from "../../clientAPI/elements/MarkdownElement";
import type { MarkdownElementViewOwner } from "../../viewAPI/ElementViewOwner";
import type { ElementView } from "../../viewAPI/ElementView";
import type { SectionView } from "../../viewAPI/SectionView";
import type { MarkdownElementMemento } from "../../clientAPI/serialize/PresentationMemento";
import { CoreElement } from "../CoreElement";
import type { CoreSection } from "../CoreSection";
import type { SerializeContext } from "../serialize/SerializeContext";

/**
 * Concrete implementation of MarkdownElement and MarkdownElementViewOwner.
 */
export class CoreMarkdownElement
  extends CoreElement
  implements MarkdownElement, MarkdownElementViewOwner
{
  private markdown_: string;

  constructor(section: CoreSection, name: string, markdown = "") {
    super(section, name);
    this.markdown_ = markdown;
  }

  protected createView(sectionView: SectionView): ElementView {
    return sectionView.createMarkdownElementView(this);
  }

  // ── MarkdownElement (clientAPI) ──────────────────────────────────────────

  get markdown(): string {
    return this.markdown_;
  }

  setMarkdown(markdown: string): void {
    this.markdown_ = markdown;
    this.eventContext_.emit("element:markdownChanged", {
      element: this,
      markdown,
    });
  }

  toMemento(ctx: SerializeContext): MarkdownElementMemento {
    return {
      type: "markdown",
      markdown: this.markdown_,
      ...this.elementMementoBase_(ctx),
    };
  }
}
