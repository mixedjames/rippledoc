import { Element } from "../model/Element";

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

  /**
   * Declare that the given elements have content-dependent properties that depend on expressions.
   * The elements will be provided in the correct order of dependency (i.e. if element A
   * depends on an expression that references element B, then B will be provided before A).
   *
   * @param elements - Array of elements with content-dependent properties.
   */
  declareContentDependentElements(elements: Element[]): void;

  /**
   * Set the visibility of trigger markers in the view.
   *
   * @param visible - Whether trigger markers should be visible.
   */
  setTriggerMarkerVisibility(visible: boolean): void;
}
