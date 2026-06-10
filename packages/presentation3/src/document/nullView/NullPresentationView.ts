import {
  PresentationView,
  PresentationViewOwner,
} from "../presentation/PresentationView";
import { SectionView, SectionViewOwner } from "../section/SectionView";
import { NullSectionView } from "./NullSectionView";

/**
 * NullPresentationView and the other classes within the nullView directory represent a "null"
 * implementation of a presentation view - they provide all the necessary methods, properties and
 * state to satisfy the interfaces but they provide no rendering.
 *
 * They exist so that a Presentation hierarchy can be created without having to choose a specific
 * rendering implementation. This is useful because:
 * - It allows view references in the DOM hierarchy to be "never null" (which simplifies)
 * - It allows the presentation hierarchy to be created and manipulated before the client has
 *   chosen a desired output
 */
export class NullPresentationView implements PresentationView {
  private owner_: PresentationViewOwner;

  constructor(owner: PresentationViewOwner) {
    this.owner_ = owner;
  }

  destroy(): void {}

  createSectionView(section: SectionViewOwner): SectionView {
    return new NullSectionView(section);
  }

  get width(): number {
    return this.owner_.basisWidth;
  }

  get height(): number {
    return this.owner_.basisHeight;
  }

  // Signature matches PresentationView; null view intentionally ignores layout inputs.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layout({ scale, tx }: { scale: number; tx: number }): void {}
}
