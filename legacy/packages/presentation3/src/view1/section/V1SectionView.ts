import * as p3 from "../../document/viewModule";
import { V1ElementView } from "../element/V1ElementView";
import { V1MarkdownElementView } from "../element/V1MarkdownElementView";
import { V1BitmapImageElementView } from "../element/V1BitmapImageElementView";
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
    return new V1BitmapImageElementView(owner, this);
  }

  createSVGImageElementView(
    owner: p3.SVGImageElementViewOwner,
  ): p3.ElementView {
    return new V1ElementView(owner, this);
  }

  createMarkdownElementView(
    owner: p3.MarkdownElementViewOwner,
  ): p3.ElementView {
    return new V1MarkdownElementView(owner, this);
  }

  // Signature matches SectionView; tx is handled by the presentation-level layout container.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layout({ scale, tx }: { scale: number; tx: number }): void {
    this.backgroundElement_.style.top = `${this.owner_.top * scale}px`;
    this.backgroundElement_.style.height = `${this.owner_.height * scale}px`;

    // Elements are laid out in presentation coordinates, so section content stays at origin.
    this.contentElement_.style.left = "0px";
    this.contentElement_.style.top = "0px";
  }

  private initDOM(): void {
    // Core styles that should be present on both:
    // - position: absolute, so they can be positioned by layout.
    // - box-sizing: border-box, so that borders are included in the section's dimensions.
    // - class names for styling and test selection.

    // Setup background container element
    this.backgroundElement_.style.position = "absolute";
    this.backgroundElement_.style.boxSizing = "border-box";
    this.backgroundElement_.style.borderTop = "dashed red 2px";
    this.backgroundElement_.style.left = "0";
    this.backgroundElement_.style.width = "100%";
    this.backgroundElement_.classList.add("section-background");

    // Setup content container element
    this.contentElement_.style.position = "absolute";
    this.contentElement_.style.boxSizing = "border-box";
    this.contentElement_.classList.add("section-content");

    // Last thing: append the section's DOM elements to the presentation's containers.
    this.parent_.htmlDOM.backgroundsContainer.appendChild(
      this.backgroundElement_,
    );
    this.parent_.htmlDOM.elementsContainer.appendChild(this.contentElement_);
  }

  get backgroundContainer(): HTMLElement {
    return this.backgroundElement_;
  }

  get contentContainer(): HTMLElement {
    return this.contentElement_;
  }
}
