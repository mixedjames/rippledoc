import * as p3 from "../../document/viewModule";
import { V1SectionView } from "../section/V1SectionView";

export class V1ElementView implements p3.ElementView {
  private owner_: p3.ElementViewOwner;
  private parent_: V1SectionView;

  constructor(owner: p3.ElementViewOwner, parent: V1SectionView) {
    this.owner_ = owner;
    this.parent_ = parent;
  }

  destroy(): void {}
}
