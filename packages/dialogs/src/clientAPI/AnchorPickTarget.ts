import type {
  PresentationRoot,
  Section,
  Element,
  ScrollTrigger,
} from "@rippledoc/presentation4";

/**
 * The set of objects that can be returned by the anchor picker dialog.
 * Covers the full presentation tree: the root, all sections and their
 * elements, and all scroll triggers.
 */
export type AnchorPickTarget =
  | PresentationRoot
  | Section
  | Element
  | ScrollTrigger;
