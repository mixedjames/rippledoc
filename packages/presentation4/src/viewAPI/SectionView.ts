import type { LayoutTransform } from "./LayoutTransform";
import type { ElementView } from "./ElementView";
import type {
  BitmapImageElementViewOwner,
  MarkdownElementViewOwner,
  SVGImageElementViewOwner,
} from "./ElementViewOwner";

/**
 * SectionView is the view-side interface for a single section.
 *
 * The model calls layout on each section view during a layout pass. The section
 * view is also the factory for element views — each element type has its own
 * creation method so the view can set up type-appropriate rendering from the start.
 */
export interface SectionView {
  /** Apply the current layout transform. Called by the model on every layout pass. */
  layout(transform: LayoutTransform): void;

  /** Create a view for a markdown element owned by this section. */
  createMarkdownElementView(owner: MarkdownElementViewOwner): ElementView;

  /** Create a view for a bitmap image element owned by this section. */
  createBitmapImageElementView(owner: BitmapImageElementViewOwner): ElementView;

  /** Create a view for an SVG image element owned by this section. */
  createSVGImageElementView(owner: SVGImageElementViewOwner): ElementView;

  /** Tear down this view and all element views it created. */
  destroy(): void;
}
