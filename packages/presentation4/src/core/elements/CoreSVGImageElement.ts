import type { SVGImageElement } from "../../clientAPI/elements/SVGImageElement";
import type { SVGImageElementViewOwner } from "../../viewAPI/ElementViewOwner";
import type { ElementView } from "../../viewAPI/ElementView";
import type { SectionView } from "../../viewAPI/SectionView";
import { CoreElement } from "../CoreElement";
import type { CoreSection } from "../CoreSection";

/**
 * Concrete implementation of SVGImageElement and SVGImageElementViewOwner.
 */
export class CoreSVGImageElement
  extends CoreElement
  implements SVGImageElement, SVGImageElementViewOwner
{
  private src_: string;

  constructor(section: CoreSection, src = "") {
    super(section);
    this.src_ = src;
  }

  protected createView(sectionView: SectionView): ElementView {
    return sectionView.createSVGImageElementView(this);
  }

  // ── SVGImageElement (clientAPI) ──────────────────────────────────────────

  get src(): string {
    return this.src_;
  }

  setSrc(src: string): void {
    this.src_ = src;
    this.eventContext_.emit("element:srcChanged", { element: this, src });
  }
}
