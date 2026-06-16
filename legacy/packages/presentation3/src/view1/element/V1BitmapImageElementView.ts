import * as p3 from "../../document/viewModule";
import { V1SectionView } from "../section/V1SectionView";
import { V1ElementView } from "./V1ElementView";

/**
 * V1 bitmap image element view.
 *
 * Bitmap image source is owned by the model; rendering is delegated to the view layer.
 */
export class V1BitmapImageElementView extends V1ElementView {
  private imgElement_: HTMLImageElement = document.createElement("img");

  constructor(owner: p3.BitmapImageElementViewOwner, parent: V1SectionView) {
    super(owner, parent);

    this.syncBitmapImage();
    this.initDOM();
  }

  protected initDOM(): void {
    super.initDOM();
    this.htmlElement.classList.add("bitmap-image-element");
    this.htmlElement.style.overflow = "hidden";

    console.log(this.imgElement_);

    this.imgElement_.style.width = "100%";
    this.imgElement_.style.height = "100%";
    this.htmlElement.appendChild(this.imgElement_);
  }

  private syncBitmapImage(): void {
    const src = this.bitmapImageOwner.src;
    const alt = this.bitmapImageOwner.alt;

    if (this.imgElement_.src !== src) {
      this.imgElement_.src = src;
    }

    if (this.imgElement_.alt !== alt) {
      this.imgElement_.alt = alt;
    }
  }

  override layout({ scale, tx }: { scale: number; tx: number }): void {
    this.syncBitmapImage();
    super.layout({ scale, tx });
  }

  /**
   * Safe cast because construction only wires bitmap image owners into this subclass.
   */
  private get bitmapImageOwner(): p3.BitmapImageElementViewOwner {
    return this.owner as p3.BitmapImageElementViewOwner;
  }
}
