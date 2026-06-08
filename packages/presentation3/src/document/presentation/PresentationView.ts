import type { SectionView, SectionViewOwner } from "../section/SectionView";
import { Presentation } from "./Presentation";

/**
 * A PresentationView allows a Presentation to be rendered.
 */
export interface PresentationView {
  destroy(): void;
  createSectionView(section: SectionViewOwner): SectionView;
}

/**
 * A PresentationViewOwner is a privileged interface that provides additional methods on
 * Presentation that are required by PresentationView implementations.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PresentationViewOwner extends Presentation {}
