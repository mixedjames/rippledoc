import type { BitmapImageElement } from "../../clientAPI/elements/BitmapImageElement";
import type { BitmapImageElementViewOwner } from "../../viewAPI/ElementViewOwner";
import type { ElementView } from "../../viewAPI/ElementView";
import type { SectionView } from "../../viewAPI/SectionView";
import { CoreElement } from "../CoreElement";
import type { CoreSection } from "../CoreSection";

/**
 * Concrete implementation of BitmapImageElement and BitmapImageElementViewOwner.
 */
export class CoreBitmapImageElement
  extends CoreElement
  implements BitmapImageElement, BitmapImageElementViewOwner
{
  private src_: string;
  private alt_: string;

  constructor(section: CoreSection, src = "", alt = "") {
    super(section);
    this.src_ = src;
    this.alt_ = alt;
  }

  protected createView(sectionView: SectionView): ElementView {
    return sectionView.createBitmapImageElementView(this);
  }

  // ── BitmapImageElement (clientAPI) ───────────────────────────────────────

  get src(): string {
    return this.src_;
  }

  get alt(): string {
    return this.alt_;
  }

  setSrc(src: string): void {
    this.src_ = src;
    this.eventContext_.emit("element:srcChanged", { element: this, src });
  }

  setAlt(alt: string): void {
    this.alt_ = alt;
    this.eventContext_.emit("element:altChanged", { element: this, alt });
  }
}
