import type { Element } from "../clientAPI/Element";
import type { Section } from "../clientAPI/Section";
import type { Layout } from "../clientAPI/Layout";
import type {
  HorizontalAnchorSet,
  VerticalAnchorSet,
} from "../anchors/AnchorSet";
import type { ElementView } from "../viewAPI/ElementView";
import type { ElementViewOwner } from "../viewAPI/ElementViewOwner";
import type { SectionViewOwner } from "../viewAPI/SectionViewOwner";
import type { SectionView } from "../viewAPI/SectionView";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import type { ConcreteXYAnchors } from "../anchors/ConcreteXYAnchors";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { NullElementView } from "./nullView/NullElementView";
import type { CoreSection } from "./CoreSection";
import type { EventContext } from "./EventContext";

/**
 * Abstract base for all concrete element types.
 *
 * Owns the shared lifecycle: anchor storage (via AnchoredObjectBase), view
 * management (null view until a real view is attached), and the layout pass.
 * Concrete subclasses supply createView() and any content-specific state.
 */
export abstract class CoreElement
  extends AnchoredObjectBase
  implements Element, ElementViewOwner
{
  private readonly section_: CoreSection;
  protected readonly eventContext_: EventContext;
  private view_: ElementView;

  constructor(section: CoreSection) {
    super(section.layoutContext);
    this.section_ = section;
    this.eventContext_ = section.eventContext;
    this.view_ = new NullElementView();
    // Register the initial bag created during super().
    this.eventContext_.registerAnchors(this.anchors, this);
  }

  /** Called by CoreSection when a layout is added to the LayoutManager. */
  onLayoutAdded(layout: Layout): void {
    this.initLayoutEntry_(layout);
  }

  /** Called by CoreSection when a view is being attached. */
  attachView(sectionView: SectionView): void {
    this.view_ = this.createView(sectionView);
  }

  /** Called by CoreSection.removeElement. Destroys this element's view. */
  detachView(): void {
    this.view_.destroy();
  }

  /** Called by CoreSection during layout passes. */
  performLayout(transform: LayoutTransform): void {
    this.view_.layout(transform);
  }

  protected abstract createView(sectionView: SectionView): ElementView;

  protected override onBagCreated_(bag: ConcreteXYAnchors): void {
    this.eventContext_.registerAnchors(bag, this);
  }

  // ── Element (clientAPI) ──────────────────────────────────────────────────

  get section(): Section {
    return this.section_;
  }

  setHorizontalAnchors(descriptor: HorizontalAnchorSet): void {
    this.setHorizontalAnchors_(descriptor);
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.left, a.right, a.width], this);
  }

  setVerticalAnchors(descriptor: VerticalAnchorSet): void {
    this.setVerticalAnchors_(descriptor);
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.top, a.bottom, a.height], this);
  }

  // ── ElementViewOwner (viewAPI) ───────────────────────────────────────────

  get sectionViewOwner(): SectionViewOwner {
    return this.section_;
  }
}
