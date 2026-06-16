import type { ConcreteSection } from "../section/Section";
import type { ElementView } from "./ElementView";
import type { SectionView } from "../section/SectionView";
import { ConcreteElementBase, type Element } from "./ElementBase";

/**
 * Public interface for raster/bitmap image elements.
 */
export interface BitmapImageElement extends Element {
  get src(): string;
  setSrc(src: string): void;

  get alt(): string;
  setAlt(alt: string): void;
}

/**
 * Privileged concrete implementation backing `BitmapImageElement`.
 */
export class ConcreteBitmapImageElement
  extends ConcreteElementBase
  implements BitmapImageElement
{
  private src_: string = "";
  private alt_: string = "";

  constructor(section: ConcreteSection) {
    super(section, "bitmap-image-element");
    this.initializeView();
  }

  protected createView(view: SectionView): ElementView {
    return view.createBitmapImageElementView(this);
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
