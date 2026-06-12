import type { ConcreteSection } from "../section/Section";
import type { ElementView } from "./ElementView";
import type { SectionView } from "../section/SectionView";
import { ConcreteElementBase, type Element } from "./ElementBase";

/**
 * Public interface for SVG image elements.
 *
 * SVG is intentionally modeled as a separate image type because we plan to support animation of
 * internal SVG components later.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SVGImageElement extends Element {
  get src(): string;
  setSrc(src: string): void;

  get alt(): string;
  setAlt(alt: string): void;
}

/**
 * Privileged concrete implementation backing `SVGImageElement`.
 */
export class ConcreteSVGImageElement
  extends ConcreteElementBase
  implements SVGImageElement
{
  private src_: string = "";
  private alt_: string = "";

  constructor(section: ConcreteSection) {
    super(section, "svg-image-element");
    this.initializeView();
  }

  protected createView(view: SectionView): ElementView {
    return view.createSVGImageElementView(this);
  }

  get src(): string {
    return this.src_;
  }

  setSrc(src: string): void {
    this.src_ = src;
  }

  get alt(): string {
    return this.alt_;
  }

  setAlt(alt: string): void {
    this.alt_ = alt;
  }
}
