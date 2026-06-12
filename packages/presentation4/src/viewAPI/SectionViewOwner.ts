import type { Section } from "../clientAPI/Section";
import type { PresentationViewOwner } from "./PresentationViewOwner";

/**
 * SectionViewOwner is the privileged model interface passed to a section view
 * at creation time.
 *
 * It extends the public Section interface with additional context that the view
 * needs but that is not part of the general client API.
 */
export interface SectionViewOwner extends Section {
  // ── Information the view reads ───────────────────────────────────────────

  /** The owner of the presentation view that created this section view. */
  get presentationViewOwner(): PresentationViewOwner;
}
