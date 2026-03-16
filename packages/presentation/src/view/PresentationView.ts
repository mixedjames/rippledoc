import { Element } from "../model/Element";

/**
 * View abstraction for a presentation.
 *
 * Concrete implementations are responsible for realising and laying out
 * the visual representation of a {@link Presentation}.
 *
 * # Realise & Layout
 * These are two key phases in the lifecycle of a view hierarchy:
 *   (1) *Realise*: Create any underlying DOM or rendering structures.
 *   (2) *Layout*: Apply layout calculations and update the view.
 *
 * Some basic rules are observed regarding these phases:
 *  - Calls to children always occur *after* the parent receives the same call
 *    (i.e. PresentationView.realise occurs before SectionView.realise and so forth)
 *  - Realise is called:
 *    - Exactly once per view instance
 *    - Before any layout calls
 *  - Layout is called:
 *    - After the realise phase
 *    - Potentially multiple times (e.g. after changes to the presentation)
 *
 * # Content-Dependent Elements
 * We support Elements that have at most one content-dependent dimension - that is, a height or
 * width that is determined by the content itself rather than an equation.
 *
 * We need some special scaffolding to support this. All content-dependent elements must be given
 * an opportunity to figure out their content-dependent dimension before any other layout
 * calculations occur. To do this, the view hierachy needs to know which elements are
 * content-dependent.
 *
 * The `declareContentDependentElements` method serves this purpose.
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
