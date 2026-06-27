import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorSectionView } from "../EditorSectionView";
import { EditorElementView } from "./EditorElementView";

export class EditorBitmapImageElementView extends EditorElementView {
  private readonly imageOwner_: p4.BitmapImageElementViewOwner;
  private readonly img_: HTMLImageElement;
  private readonly unsubscribeSrc_: () => void;
  private readonly unsubscribeAlt_: () => void;
  private readonly unsubscribeObjectFit_: () => void;

  constructor(
    owner: p4.BitmapImageElementViewOwner,
    parent: EditorSectionView,
  ) {
    super(owner, parent);
    this.imageOwner_ = owner;
    this.element.classList.add("bitmap-image-element");

    // contentElement has no explicit height by default; set 100% so the <img>
    // can resolve its own height:100% against the outer element's pixel height.
    this.contentElement.style.height = "100%";
    // overflow:hidden lets object-fit:cover clip correctly.
    this.element.style.overflow = "hidden";

    this.img_ = document.createElement("img");
    this.img_.style.cssText = "width:100%;height:100%;display:block;";
    this.img_.src = owner.src;
    this.img_.alt = owner.alt;
    this.img_.style.objectFit = owner.objectFit;
    this.contentElement.appendChild(this.img_);

    const pres = owner.sectionViewOwner.presentationViewOwner;

    this.unsubscribeSrc_ = pres.events.on(
      "element:srcChanged",
      ({ element, src }) => {
        if (element === this.imageOwner_) this.img_.src = src;
      },
    );

    this.unsubscribeAlt_ = pres.events.on(
      "element:altChanged",
      ({ element, alt }) => {
        if (element === this.imageOwner_) this.img_.alt = alt;
      },
    );

    this.unsubscribeObjectFit_ = pres.events.on(
      "element:objectFitChanged",
      ({ element, objectFit }) => {
        if (element === this.imageOwner_) this.img_.style.objectFit = objectFit;
      },
    );
  }

  override destroy(): void {
    this.unsubscribeSrc_();
    this.unsubscribeAlt_();
    this.unsubscribeObjectFit_();
    super.destroy();
  }
}
