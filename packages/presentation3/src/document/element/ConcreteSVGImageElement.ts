import type { ConcreteSection } from "../section/Section";
import type { ElementView } from "./ElementView";
import type { SectionView } from "../section/SectionView";
import { ConcreteElementBase, type Element } from "./ElementBase";

// Marker interface for SVG-specific element APIs to be added incrementally.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SVGImageElement extends Element {}

export class ConcreteSVGImageElement
  extends ConcreteElementBase
  implements SVGImageElement
{
  constructor(section: ConcreteSection) {
    super(section, "svg-image-element");
  }

  protected createView(view: SectionView): ElementView {
    return view.createSVGImageElementView(this);
  }
}
