import type { ConcreteSection } from "../section/Section";
import type { ElementView } from "./ElementView";
import type { SectionView } from "../section/SectionView";
import { ConcreteElementBase, type Element } from "./ElementBase";

export interface MarkdownElement extends Element {
  get markdown(): string;
  setMarkdown(markdown: string): void;
}

export class ConcreteMarkdownElement
  extends ConcreteElementBase
  implements MarkdownElement
{
  private markdown_: string;

  constructor(section: ConcreteSection, markdown = "") {
    super(section, "markdown-element");
    this.markdown_ = markdown;
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
