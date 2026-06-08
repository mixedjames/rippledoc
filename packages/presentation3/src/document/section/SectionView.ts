import { Section } from "./Section";
import { PresentationViewOwner } from "../presentation/PresentationView";

/**
 * A SectionView allows a Section to be rendered.
 */
export interface SectionView {
  destroy(): void;
}

export class NullSectionView {
  constructor() {}
  destroy(): void {}
}

/**
 * A SectionViewOwner is a privileged interface that provides additional methods on Section
 * that are required by SectionView implementations.
 */
export interface SectionViewOwner extends Section {
  get presentationViewOwner(): PresentationViewOwner;
}
