import type { SectionView, SectionViewOwner } from "../section/SectionView";
import { Presentation } from "./Presentation";

/**
 * A PresentationView allows a Presentation to be rendered.
 */
export interface PresentationView {
  destroy(): void;
  createSectionView(section: SectionViewOwner): SectionView;

  get width(): number;
  get height(): number;

  layout({ scale, tx }: { scale: number; tx: number }): void;
}

/**
 * A PresentationViewOwner is a privileged interface that provides additional methods on
 * Presentation that are required by PresentationView implementations.
 */
export interface PresentationViewOwner extends Presentation {
  layout(width: number, height: number): void;

  get layoutTransformation(): { scale: number; tx: number };
}
