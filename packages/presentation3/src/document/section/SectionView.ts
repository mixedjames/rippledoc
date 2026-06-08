import { Section } from "./Section";
import { PresentationViewOwner } from "../presentation/PresentationView";
import { ElementView, ElementViewOwner } from "../element/ElementView";

/**
 * A SectionView allows a Section to be rendered.
 */
export interface SectionView {
  destroy(): void;

  createElementView(owner: ElementViewOwner): ElementView;
}

/**
 * A SectionViewOwner is a privileged interface that provides additional methods on Section
 * that are required by SectionView implementations.
 */
export interface SectionViewOwner extends Section {
  get presentationViewOwner(): PresentationViewOwner;
}
