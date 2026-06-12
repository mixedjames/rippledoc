import * as p3 from "../../document/viewModule";
import { V1SectionView } from "../section/V1SectionView";

export class V1ElementView implements p3.ElementView {
  private owner_: p3.ElementViewOwner;
  private parent_: V1SectionView;

  private htmlElement_: HTMLElement = document.createElement("div");

  constructor(owner: p3.ElementViewOwner, parent: V1SectionView) {
    this.owner_ = owner;
    this.parent_ = parent;
  }

  destroy(): void {}

  protected initDOM(): void {
    this.htmlElement_.classList.add("element");
    this.parent_.contentContainer.appendChild(this.htmlElement_);

    this.htmlElement_.style.position = "absolute";
    this.htmlElement_.style.boxSizing = "border-box";
    this.htmlElement_.style.border = "solid blue 1px";
  }

  // Signature matches ElementView; tx is not required for per-element layout.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layout({ scale, tx }: { scale: number; tx: number }): void {
    this.htmlElement_.style.left = `${this.owner_.left * scale}px`;
    this.htmlElement_.style.top = `${this.owner_.top * scale}px`;

    this.htmlElement_.style.width = `${this.owner_.width * scale}px`;
    this.htmlElement_.style.height = `${this.owner_.height * scale}px`;
  }

  protected get owner(): p3.ElementViewOwner {
    return this.owner_;
  }

  protected get parent(): V1SectionView {
    return this.parent_;
  }

  protected get htmlElement(): HTMLElement {
    return this.htmlElement_;
  }
}
