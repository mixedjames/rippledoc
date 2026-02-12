/**
 * View abstraction for an element.
 *
 * Concrete implementations are responsible for realising and laying out
 * the visual representation of a {@link Element}.
 */
export interface ElementView {
  /** Create any underlying DOM or rendering structures. */
  realise(): void;

  /** Apply layout calculations and update the view. */
  layout(): void;
}
