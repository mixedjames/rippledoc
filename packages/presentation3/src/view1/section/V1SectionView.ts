import * as p3 from "../../document/viewModule";
import { V1ElementView } from "../element/V1ElementView";
import { V1PresentationView } from "../presentation/V1PresentationView";

export class V1SectionView implements p3.SectionView {
  // Structural relationships ----------------------------------------------------------------------
  //
  private owner_: p3.SectionViewOwner;
  private parent_: V1PresentationView;

  // DOM elements ----------------------------------------------------------------------------------
  //
  private backgroundElement_: HTMLElement = document.createElement("div");
  private contentElement_: HTMLElement = document.createElement("div");

  constructor(owner: p3.SectionViewOwner, parent: V1PresentationView) {
    this.owner_ = owner;
    this.parent_ = parent;

    this.initDOM();
  }

  destroy(): void {}

  createBitmapImageElementView(
    owner: p3.BitmapImageElementViewOwner,
  ): p3.ElementView {
    return new V1ElementView(owner, this);
  }

  createSVGImageElementView(
    owner: p3.SVGImageElementViewOwner,
  ): p3.ElementView {
    return new V1ElementView(owner, this);
  }

  createMarkdownElementView(
    owner: p3.MarkdownElementViewOwner,
  ): p3.ElementView {
    return new V1ElementView(owner, this);
  }

  // Signature matches SectionView; tx is handled by the presentation-level layout container.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layout({ scale, tx }: { scale: number; tx: number }): void {
    this.backgroundElement_.style.left = `${this.owner_.left * scale}px`;
    this.backgroundElement_.style.width = `${this.owner_.width * scale}px`;
    this.backgroundElement_.style.top = `${this.owner_.top * scale}px`;
    this.backgroundElement_.style.height = `${this.owner_.height * scale}px`;

    // Elements are laid out in presentation coordinates, so section content stays at origin.
    this.contentElement_.style.left = "0px";
    this.contentElement_.style.top = "0px";
  }

  private initDOM(): void {
    this.backgroundElement_.style.position = "absolute";
    this.contentElement_.style.position = "absolute";

    this.backgroundElement_.style.boxSizing = "border-box";
    this.contentElement_.style.boxSizing = "border-box";

    this.backgroundElement_.classList.add("section-background");
    this.parent_.htmlDOM.backgroundsContainer.appendChild(
      this.backgroundElement_,
    );

    this.contentElement_.classList.add("section-content");
    this.parent_.htmlDOM.elementsContainer.appendChild(this.contentElement_);

    this.backgroundElement_.style.borderTop = "dashed red 2px";
  }

  get backgroundContainer(): HTMLElement {
    return this.backgroundElement_;
  }

  get contentContainer(): HTMLElement {
    return this.contentElement_;
  }
}
