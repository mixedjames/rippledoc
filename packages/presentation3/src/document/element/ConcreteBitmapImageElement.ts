import type { ConcreteSection } from "../section/Section";
import type { ElementView } from "./ElementView";
import type { SectionView } from "../section/SectionView";
import { ConcreteElementBase, type Element } from "./ElementBase";

// Marker interface for bitmap-specific element APIs to be added incrementally.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BitmapImageElement extends Element {}

export class ConcreteBitmapImageElement
  extends ConcreteElementBase
  implements BitmapImageElement
{
  constructor(section: ConcreteSection) {
    super(section, "bitmap-image-element");
  }

  protected createView(view: SectionView): ElementView {
    return view.createBitmapImageElementView(this);
  }
}
