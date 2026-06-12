import type { LayoutTransform } from "./LayoutTransform";
import type { SectionView } from "./SectionView";
import type { SectionViewOwner } from "./SectionViewOwner";
import type { PresentationViewOwner } from "./PresentationViewOwner";

/**
 * PresentationView is the view-side interface for the presentation root.
 *
 * A presentation view is the top of the view hierarchy. It is responsible for
 * managing the physical container (e.g. a DOM element) that the presentation
 * renders into, and for acting as the factory for section views.
 *
 * Physical dimensions are read from the view immediately after it is attached,
 * and subsequently reported to the model via PresentationViewOwner.notifyViewResized.
 */
export interface PresentationView {
  /** Current physical width of the presentation container in pixels. */
  get width(): number;

  /** Current physical height of the presentation container in pixels. */
  get height(): number;

  /** Apply the current layout transform. Called by the model on every layout pass. */
  layout(transform: LayoutTransform): void;

  /** Create a view for a section in this presentation. */
  createSectionView(owner: SectionViewOwner): SectionView;

  /** Tear down this view and release all associated resources. */
  destroy(): void;
}

/**
 * A factory function that constructs a PresentationView for a given owner.
 *
 * View packages export functions of this type. Clients pass one to
 * Presentation.attachView() to connect a renderer to the presentation.
 *
 * Example:
 *   presentation.attachView(createV1PresentationView({ container: '#app' }));
 */
export type PresentationViewFactory = (
  owner: PresentationViewOwner,
) => PresentationView;
