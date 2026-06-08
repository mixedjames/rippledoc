import { SectionViewOwner } from "../section/SectionView";
import { Element } from "./Element";

/**
 * An ElementView allows an Element to be rendered.
 */
export interface ElementView {
  destroy(): void;
}

/**
 * An ElementViewOwner is a privileged interface that provides additional methods on Element
 * that are required by ElementView implementations.
 */
export interface ElementViewOwner extends Element {
  get sectionView(): SectionViewOwner;
}
