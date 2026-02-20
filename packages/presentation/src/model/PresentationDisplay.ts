/**
 * Public, renderer-agnostic interface for controlling how a
 * {@link Presentation} is displayed.
 *
 * This acts as a lightweight façade over the internal view
 * hierarchy created via {@link ViewFactory}. It is intended for
 * consumers of the presentation model, not for view
 * implementations themselves.
 */
export interface PresentationDisplay {
  /**
   * Realise the underlying view hierarchy for this presentation.
   */
  realise(): void;

  /**
   * Apply layout using the current geometry.
   */
  layout(): void;

  /**
   * Control visibility of any trigger markers in the active view.
   */
  setTriggerMarkerVisibility(visible: boolean): void;
}
