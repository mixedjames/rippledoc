import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { Section } from "../clientAPI/Section";
import type { Layout } from "../clientAPI/Layout";
import type { LayoutManager } from "../clientAPI/LayoutManager";
import type { PresentationView } from "../viewAPI/PresentationView";
import type { PresentationViewOwner } from "../viewAPI/PresentationViewOwner";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { CoreSection } from "./CoreSection";
import { NullPresentationView } from "./nullView/NullPresentationView";
import type { CorePresentation } from "./CorePresentation";
import type { EventContext } from "./EventContext";
import type { ConcreteXYAnchors } from "../anchors/ConcreteXYAnchors";

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
  private readonly eventContext_: EventContext;
  private readonly sections_: CoreSection[] = [];
  // Tracks the current view so sections added after attachView get a real view immediately.
  private view_: PresentationView = new NullPresentationView();

  constructor(presentation: CorePresentation) {
    super(presentation.layout);
    this.presentation_ = presentation;
    this.eventContext_ = presentation.eventContext;
    // Register the initial bag created during super().
    this.eventContext_.registerAnchors(this.anchors, this);
  }

  /** Exposes the LayoutManager so CoreSection can thread it to AnchoredObjectBase. */
  get layoutContext(): LayoutManager {
    return this.presentation_.layout;
  }

  /** Exposes EventContext so CoreSection can access it via the root reference. */
  get eventContext(): EventContext {
    return this.eventContext_;
  }

  protected override onBagCreated_(bag: ConcreteXYAnchors): void {
    this.eventContext_.registerAnchors(bag, this);
  }

  /** Called by CorePresentation when a layout is added to the LayoutManager. */
  onLayoutAdded(layout: Layout): void {
    this.initLayoutEntry_(layout);
    this.sections_.forEach((s) => s.onLayoutAdded(layout));
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
    this.eventContext_.emit("section:added", {
      section,
      index: this.sections_.length - 1,
    });
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
    this.eventContext_.emit("section:removed", { section, index });
  }
}
