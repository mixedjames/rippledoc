import { SectionViewOwner } from "../section/SectionView";
import type { Element } from "./ElementBase";
import type { BitmapImageElement } from "./ConcreteBitmapImageElement";
import type { SVGImageElement } from "./ConcreteSVGImageElement";
import type { MarkdownElement } from "./ConcreteMarkdownElement";

/**
 * An ElementView allows an Element to be rendered.
 */
export interface ElementView {
  layout({ scale, tx }: { scale: number; tx: number }): void;
  destroy(): void;
}

/**
 * An ElementViewOwner is a privileged interface that provides additional methods on Element
 * that are required by ElementView implementations.
 */
export interface ElementViewOwner extends Element {
  get sectionView(): SectionViewOwner;
}

export interface BitmapImageElementViewOwner
  extends ElementViewOwner, BitmapImageElement {}

export interface SVGImageElementViewOwner
  extends ElementViewOwner, SVGImageElement {}

export interface MarkdownElementViewOwner
  extends ElementViewOwner, MarkdownElement {}
