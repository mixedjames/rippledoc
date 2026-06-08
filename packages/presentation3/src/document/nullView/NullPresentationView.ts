import {
  PresentationView,
  PresentationViewOwner,
} from "../presentation/PresentationView";
import { SectionView, SectionViewOwner } from "../section/SectionView";
import { NullSectionView } from "./NullSectionView";

export class NullPresentationView implements PresentationView {
  private owner_: PresentationViewOwner;

  constructor(owner: PresentationViewOwner) {
    this.owner_ = owner;
  }

  destroy(): void {}

  createSectionView(section: SectionViewOwner): SectionView {
    return new NullSectionView(section);
  }
}
