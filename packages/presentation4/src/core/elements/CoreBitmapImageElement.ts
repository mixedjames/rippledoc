import type { BitmapImageElement } from "../../clientAPI/elements/BitmapImageElement";
import type { BitmapImageElementViewOwner } from "../../viewAPI/ElementViewOwner";
import type { ElementView } from "../../viewAPI/ElementView";
import type { SectionView } from "../../viewAPI/SectionView";
import type { BitmapImageElementMemento } from "../../clientAPI/serialize/PresentationMemento";
import { CoreElement } from "../CoreElement";
import type { CoreSection } from "../CoreSection";
import type { SerializeContext } from "../serialize/SerializeContext";

/**
 * Concrete implementation of BitmapImageElement and BitmapImageElementViewOwner.
 */
export class CoreBitmapImageElement
  extends CoreElement
  implements BitmapImageElement, BitmapImageElementViewOwner
{
  private src_: string;
  private alt_: string;

  constructor(
    section: CoreSection,
    name: string,
    options: { src?: string; alt?: string } = {},
  ) {
    super(section, name);
    this.src_ = options.src ?? "";
    this.alt_ = options.alt ?? "";
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

  toMemento(ctx: SerializeContext): BitmapImageElementMemento {
    return {
      type: "bitmap",
      src: this.src_,
      alt: this.alt_,
      ...this.elementMementoBase_(ctx),
    };
  }
}
