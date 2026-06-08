import { ElementView, ElementViewOwner } from "../element/ElementView";

export class NullElementView implements ElementView {
  private owner_: ElementViewOwner;

  constructor(owner: ElementViewOwner) {
    this.owner_ = owner;
  }

  destroy(): void {}
}
