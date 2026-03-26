import { HTMLElementView } from "../../htmlView/HTMLElementView";
import { TextBoxElement } from "../TextBoxElement";
import { HTMLSectionView } from "../../../section/htmlView/HTMLSectionView";

export class HTMLTextBoxElementView extends HTMLElementView {
  constructor(options: {
    sectionView: HTMLSectionView;
    element: TextBoxElement;
  }) {
    super({ ...options, subclass: true });

    this.createDOM();
  }

  get element(): TextBoxElement {
    // We know that this is a TextBoxElement, so we can cast it here.
    return super.element as TextBoxElement;
  }

  protected subclassCreateDOM(): void {
    this.htmlElement.appendChild(this.element.content);
  }

  protected subclassLayout(): void {}
}
