/**
 * viewAPI — the view interface set for presentation4.
 *
 * This module defines the contracts used by view implementations — code that
 * renders a presentation to a specific target (HTML/DOM, canvas, etc.).
 *
 * View implementations should import exclusively from this module:
 *
 *   import * as p4 from "@rippledoc/presentation4/viewAPI";
 *
 * This barrel re-exports all clientAPI types (so views can read model state)
 * alongside the view-specific interfaces. A view implementation needs nothing
 * else from this package.
 *
 * Compatibility note: viewAPI is less stable than clientAPI. If you implement
 * a custom view, expect to track changes here across versions.
 *
 * @see clientAPI for the interfaces used by presentation consumers.
 */

// Re-export the full client API — views need to read model state.
export type * from "../clientAPI/index";

// View-side interfaces (what view implementations must provide).
export type { LayoutTransform } from "./LayoutTransform";
export type {
  PresentationView,
  PresentationViewFactory,
} from "./PresentationView";
export type { SectionView } from "./SectionView";
export type { ElementView } from "./ElementView";

// ViewOwner interfaces (privileged model surface exposed to views).
export type { PresentationViewOwner } from "./PresentationViewOwner";
export type { SectionViewOwner } from "./SectionViewOwner";
export type {
  ElementViewOwner,
  MarkdownElementViewOwner,
  BitmapImageElementViewOwner,
  SVGImageElementViewOwner,
} from "./ElementViewOwner";
