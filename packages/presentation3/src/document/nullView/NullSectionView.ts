import { ElementView, ElementViewOwner } from "../element/ElementView";
import { SectionView, SectionViewOwner } from "../section/SectionView";
import { NullElementView } from "./NullElementView";

export class NullSectionView implements SectionView {
  private owner_: SectionViewOwner;

  constructor(owner: SectionViewOwner) {
    this.owner_ = owner;
  }

  destroy(): void {}

  createElementView(owner: ElementViewOwner): ElementView {
    return new NullElementView(owner);
  }
}
