import type { Presentation } from "../clientAPI/Presentation";
import type { LayoutTransform } from "./LayoutTransform";

/**
 * PresentationViewOwner is the privileged model interface passed to a
 * presentation view at creation time.
 *
 * It extends the public Presentation interface with additional context that the
 * view needs but that is not part of the general client API.
 */
export interface PresentationViewOwner extends Presentation {
  // ── Information the view reads ───────────────────────────────────────────

  /** The current layout transform, reflecting the latest physical dimensions. */
  get layoutTransform(): LayoutTransform;

  // ── Callbacks the view makes into the model ──────────────────────────────

  /**
   * Notify the model that the physical viewport has changed size.
   * The view should call this whenever its container is resized (e.g. from a
   * ResizeObserver callback) so the model can recalculate layout and push
   * updated transforms back down to all views.
   */
  notifyViewResized(physicalWidth: number, physicalHeight: number): void;

  /**
   * Notify the model of the current scroll position in virtual basis-space
   * coordinates. The view should call this on every scroll event so the model
   * can evaluate all registered scroll triggers and emit their events.
   *
   * scrollY is the top edge of the visible viewport in the same coordinate
   * space as section and element anchors.
   */
  notifyScrolled(scrollY: number): void;
}
