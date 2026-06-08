import { PresentationView, PresentationViewOwner } from "./PresentationView";
import { SectionView, SectionViewOwner } from "../section/SectionView";
import { ElementView, ElementViewOwner } from "../element/ElementView";

export interface ViewFactory {
  createPresentationView(owner: PresentationViewOwner): PresentationView;
  createSectionView(owner: SectionViewOwner): SectionView;
  createElementView(owner: ElementViewOwner): ElementView;
}
