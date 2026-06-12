import type { Element } from "../clientAPI/Element";
import type { Section } from "../clientAPI/Section";
import type { ElementView } from "../viewAPI/ElementView";
import type { ElementViewOwner } from "../viewAPI/ElementViewOwner";
import type { SectionViewOwner } from "../viewAPI/SectionViewOwner";
import type { SectionView } from "../viewAPI/SectionView";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { NullElementView } from "./nullView/NullElementView";
import type { CoreSection } from "./CoreSection";

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
  private view_: ElementView;

  constructor(section: CoreSection) {
    super();
    this.section_ = section;
    this.view_ = new NullElementView();
  }

  /** Called by CoreSection when a view is being attached. */
  attachView(sectionView: SectionView): void {
    this.view_.destroy();
    this.view_ = this.createView(sectionView);
  }

  /** Called by CoreSection during layout passes. */
  performLayout(transform: LayoutTransform): void {
    this.view_.layout(transform);
  }

  protected abstract createView(sectionView: SectionView): ElementView;

  // ── Element (clientAPI) ──────────────────────────────────────────────────

  get section(): Section {
    return this.section_;
  }

  // ── ElementViewOwner (viewAPI) ───────────────────────────────────────────

  get sectionViewOwner(): SectionViewOwner {
    return this.section_;
  }
}
