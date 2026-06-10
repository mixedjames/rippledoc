import { ElementView, ElementViewOwner } from "../element/ElementView";

/**
 * See NullPresentationView for details of the NullXXXView class hierarchy.
 *
 * Note to future James:
 * - Do not add documentation here unless it really is specific to NullElementView. DRY.
 */
export class NullElementView implements ElementView {
  private owner_: ElementViewOwner;

  constructor(owner: ElementViewOwner) {
    this.owner_ = owner;
  }

  destroy(): void {}

  // Signature matches ElementView; null view intentionally ignores layout inputs.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layout({ scale, tx }: { scale: number; tx: number }): void {}
}
