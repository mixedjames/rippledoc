import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { Section } from "../clientAPI/Section";
import type { PresentationView } from "../viewAPI/PresentationView";
import type { PresentationViewOwner } from "../viewAPI/PresentationViewOwner";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { CoreSection } from "./CoreSection";
import { NullPresentationView } from "./nullView/NullPresentationView";
import type { CorePresentation } from "./CorePresentation";

/**
 * Concrete implementation of PresentationRoot.
 *
 * The structural root of the document tree and the origin of the global virtual
 * coordinate space. Owned by CorePresentation. Owns CoreSection instances.
 */
export class CorePresentationRoot
  extends AnchoredObjectBase
  implements PresentationRoot
{
  private readonly presentation_: CorePresentation;
  private readonly sections_: CoreSection[] = [];
  // Tracks the current view so sections added after attachView get a real view immediately.
  private view_: PresentationView = new NullPresentationView();

  constructor(presentation: CorePresentation) {
    super();
    this.presentation_ = presentation;
  }

  /** Called by CorePresentation when a view is being attached. */
  attachView(presentationView: PresentationView): void {
    this.view_ = presentationView;
    this.sections_.forEach((s) => s.attachView(presentationView));
  }

  /** Called by CorePresentation during layout passes. */
  performLayout(transform: LayoutTransform): void {
    this.sections_.forEach((s) => s.performLayout(transform));
  }

  /** Exposes the presentation as PresentationViewOwner for section view owners to reach. */
  get presentationViewOwner(): PresentationViewOwner {
    return this.presentation_;
  }

  // ── PresentationRoot (clientAPI) ─────────────────────────────────────────

  get basisWidth(): number {
    return this.presentation_.layout.activeLayout.basisWidth;
  }

  get basisHeight(): number {
    return this.presentation_.layout.activeLayout.basisHeight;
  }

  get totalHeight(): number {
    // Will be computed from section anchors once anchor system is in place.
    return 0;
  }

  addSection(): Section {
    const section = new CoreSection(this);
    // If a real view is already attached, wire the new section into it immediately
    // rather than leaving it with a null view until the next full attach cycle.
    section.attachView(this.view_);
    this.sections_.push(section);
    return section;
  }

  getSections(): readonly Section[] {
    return this.sections_;
  }
}
