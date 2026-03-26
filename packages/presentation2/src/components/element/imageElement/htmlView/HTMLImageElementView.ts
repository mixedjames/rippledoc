import { HTMLElementView } from "../../htmlView/HTMLElementView";
import { ImageElement, ImageFit } from "../ImageElement";
import { HTMLSectionView } from "../../../section/htmlView/HTMLSectionView";

export class HTMLImageElementView extends HTMLElementView {
  constructor(options: {
    sectionView: HTMLSectionView;
    element: ImageElement;
  }) {
    super({ ...options, subclass: true });

    this.createDOM();
  }

  get element(): ImageElement {
    // We know that this is a ImageElement, so we can cast it here.
    return super.element as ImageElement;
  }

  protected subclassCreateDOM(): void {
    const img = document.createElement("img");
    img.src = this.element.source;
    switch (this.element.fit) {
      case ImageFit.Fill:
        img.style.objectFit = "fill";
        break;
      case ImageFit.Contain:
        img.style.objectFit = "contain";
        break;
      case ImageFit.Cover:
        img.style.objectFit = "cover";
        break;
    }
    img.style.width = "100%";
    img.style.height = "100%";

    this.htmlElement.classList.add("rdoc-image-element");
    this.htmlElement.appendChild(img);
  }

  protected subclassLayout(): void {}
}
