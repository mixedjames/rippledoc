/**
 * View abstraction for a presentation.
 *
 * Concrete implementations are responsible for realising and laying out
 * the visual representation of a {@link Presentation}.
 */
export interface PresentationView {
  /** Create any underlying DOM or rendering structures. */
  realise(): void;

  /** Apply layout calculations and update the view. */
  layout(): void;
}
