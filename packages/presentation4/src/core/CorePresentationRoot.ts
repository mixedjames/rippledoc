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
 *
 * TODO: the inherited AnchoredObjectBase anchors will represent the canvas bounds
 * (left=0, top=0, width=basisWidth, height=totalHeight) once layout wires them up.
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
    const last = this.sections_[this.sections_.length - 1];
    return last ? last.anchors.bottom.value : 0;
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

  removeSection(section: Section): void {
    const index = this.sections_.findIndex((s) => s === section);
    if (index < 0) throw new Error("Section does not belong to this root.");
    const coreSection = this.sections_[index]!;
    this.sections_.splice(index, 1);
    coreSection.detachView();
  }
}
