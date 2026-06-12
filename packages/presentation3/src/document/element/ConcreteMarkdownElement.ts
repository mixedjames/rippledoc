import type { ConcreteSection } from "../section/Section";
import type { ElementView } from "./ElementView";
import type { SectionView } from "../section/SectionView";
import { ConcreteElementBase, type Element } from "./ElementBase";

/**
 * Public interface for markdown document elements that carry raw markdown source.
 */
export interface MarkdownElement extends Element {
  get markdown(): string;
  setMarkdown(markdown: string): void;
}

/**
 * Privileged concrete implementation backing `MarkdownElement`.
 *
 * Parsing/rendering is delegated to view implementations.
 */
export class ConcreteMarkdownElement
  extends ConcreteElementBase
  implements MarkdownElement
{
  private markdown_: string;

  constructor(section: ConcreteSection, markdown = "") {
    super(section, "markdown-element");
    this.markdown_ = markdown;
    this.initializeView();
  }

  protected createView(view: SectionView): ElementView {
    return view.createMarkdownElementView(this);
  }

  get markdown(): string {
    return this.markdown_;
  }

  setMarkdown(markdown: string): void {
    this.markdown_ = markdown;
  }
}
