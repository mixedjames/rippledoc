import {
  BitmapImageElementViewOwner,
  ElementView,
  MarkdownElementViewOwner,
  SVGImageElementViewOwner,
} from "../element/ElementView";
import { SectionView, SectionViewOwner } from "../section/SectionView";
import { NullElementView } from "./NullElementView";

/**
 * See NullPresentationView for details of the NullXXXView class hierarchy.
 *
 * Note to future James:
 * - Do not add documentation here unless it really is specific to NullSectionView. DRY.
 */
export class NullSectionView implements SectionView {
  private owner_: SectionViewOwner;

  constructor(owner: SectionViewOwner) {
    this.owner_ = owner;
  }

  destroy(): void {}

  createBitmapImageElementView(
    owner: BitmapImageElementViewOwner,
  ): ElementView {
    return new NullElementView(owner);
  }

  createSVGImageElementView(owner: SVGImageElementViewOwner): ElementView {
    return new NullElementView(owner);
  }

  createMarkdownElementView(owner: MarkdownElementViewOwner): ElementView {
    return new NullElementView(owner);
  }

  // Signature matches SectionView; null view intentionally ignores layout inputs.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layout({ scale, tx }: { scale: number; tx: number }): void {}
}
