import { HTMLSectionView } from "../section/HTMLSectionView";
import { Element } from "./Element";

export class HTMLElementView {
  // Structural relationships ----------------------------------------------------------------------
  //
  private element_: Element;
  private sectionView_: HTMLSectionView;

  constructor(options: { sectionView: HTMLSectionView; element: Element }) {
    this.sectionView_ = options.sectionView;
    this.element_ = options.element;
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get element(): Element {
    return this.element_;
  }

  get sectionView(): HTMLSectionView {
    return this.sectionView_;
  }

  // ----------------------------------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------------------------------

  createDOM(): void {
    this.subclassCreateDOM();
  }

  protected subclassCreateDOM(): void {}

  layout(): void {
    this.subclassLayout();
  }

  protected subclassLayout(): void {}
}
