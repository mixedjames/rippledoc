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
 * ElementViewOwner and its subtype variants are privileged internal interfaces used by
 * view implementations.
 *
 * Client code should depend on the public element interfaces, not on `*ViewOwner` contracts.
 */
export interface ElementViewOwner extends Element {
  get sectionView(): SectionViewOwner;
}

/** Privileged owner interface used by bitmap element views. */
export interface BitmapImageElementViewOwner
  extends ElementViewOwner, BitmapImageElement {}

/** Privileged owner interface used by SVG element views. */
export interface SVGImageElementViewOwner
  extends ElementViewOwner, SVGImageElement {}

/** Privileged owner interface used by markdown element views. */
export interface MarkdownElementViewOwner
  extends ElementViewOwner, MarkdownElement {}
