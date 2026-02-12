/**
 * View abstraction for a section.
 *
 * Concrete implementations are responsible for realising and laying out
 * the visual representation of a {@link Section}.
 */
export interface SectionView {
  /** Create any underlying DOM or rendering structures. */
  realise(): void;

  /** Apply layout calculations and update the view. */
  layout(): void;
}
