import { HTMLPresentationViewRoot } from "../../presentation/htmlView/HTMLPresentationViewRoot";
import { HTMLSectionView } from "../../section/htmlView/HTMLSectionView";
import { Element } from "../Element";

export class HTMLElementView {
  // Structural relationships ----------------------------------------------------------------------
  //
  private element_: Element;
  private sectionView_: HTMLSectionView;

  private htmlElement_!: HTMLElement;

  constructor(options: { sectionView: HTMLSectionView; element: Element }) {
    this.sectionView_ = options.sectionView;
    this.element_ = options.element;

    this.createDOM();
  }

  disconnect(): void {}

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get element(): Element {
    return this.element_;
  }

  get sectionView(): HTMLSectionView {
    return this.sectionView_;
  }

  get presentationView(): HTMLPresentationViewRoot {
    return this.sectionView.presentationView;
  }

  // ----------------------------------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------------------------------

  private createDOM(): void {
    this.htmlElement_ = document.createElement("div");
    this.htmlElement_.classList.add("rdoc-element");
    this.htmlElement_.style.position = "absolute";

    this.sectionView.htmlContentElement.appendChild(this.htmlElement_);

    this.subclassCreateDOM();
  }

  protected subclassCreateDOM(): void {}

  layout(): void {
    const scale = this.presentationView.physicalDimensions.scale;

    this.htmlElement_.style.left = `${this.element.left * scale}px`;
    this.htmlElement_.style.top = `${this.element.top * scale}px`;
    this.htmlElement_.style.width = `${this.element.width * scale}px`;
    this.htmlElement_.style.height = `${this.element.height * scale}px`;

    this.subclassLayout();
  }

  protected subclassLayout(): void {}
}
