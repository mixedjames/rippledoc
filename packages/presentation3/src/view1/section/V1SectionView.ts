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

  createElementView(owner: p3.ElementViewOwner): p3.ElementView {
    return new V1ElementView(owner, this);
  }

  private initDOM(): void {
    this.backgroundElement_.classList.add("section-background");
    this.parent_.htmlDOM.backgroundsContainer.appendChild(
      this.backgroundElement_,
    );

    this.contentElement_.classList.add("section-content");
    this.parent_.htmlDOM.elementsContainer.appendChild(this.contentElement_);
  }
}
