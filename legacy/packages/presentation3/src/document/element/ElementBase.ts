import type { ConcreteSection, Section } from "../section/Section";
import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import type { Presentation } from "../presentation/Presentation";
import type { SectionView, SectionViewOwner } from "../section/SectionView";
import type { ElementView } from "./ElementView";
import type * as Anchors from "../../anchors/index";
import { Layout } from "../presentation/Layout";

/**
 * Base contract shared by all element subtypes.
 *
 * Subtype-specific data should be added in subtype interfaces (for example markdown text,
 * bitmap source metadata, SVG animation controls).
 *
 * This is part of the public model API: client code should prefer this interface (and subtype
 * interfaces) rather than concrete classes.
 */
export interface Element extends Anchors.XYAnchoredObject {
  get section(): Section;

  get presentation(): Presentation;

  replaceView(view: SectionView): void;
  layout({ scale, tx }: { scale: number; tx: number }): void;
}

/**
 * Shared base class for concrete element implementations.
 *
 * Correct usage:
 * - Derive one concrete class per subtype and provide a unique `objectType` label.
 * - Implement `createView` by calling the matching explicit `SectionView#createXxxElementView`.
 * - Keep shared geometry/view lifecycle logic here; keep subtype state in derived classes.
 *
 * This class is a privileged internal implementation seam, not the primary client-facing type.
 */
export abstract class ConcreteElementBase
  extends ConcreteAnchoredObjectBase
  implements Element
{
  private readonly section_: ConcreteSection;

  private view_: ElementView | null = null;

  constructor(section: ConcreteSection, objectType = "element") {
    super(objectType);

    this.section_ = section;
    this.supplyDefaultLayout(section.presentation.defaultLayout);
  }

  protected abstract createView(view: SectionView): ElementView;

  /**
   * Initializes the concrete view instance.
   *
   * Must be called by concrete subclasses after subtype state is fully initialized.
   */
  protected initializeView(view: SectionView = this.section_.view): void {
    this.view_ = this.createView(view);
  }

  private get requiredView(): ElementView {
    if (!this.view_) {
      throw new Error("Element view was not initialized.");
    }
    return this.view_;
  }

  get section(): Section {
    return this.section_;
  }

  get presentation(): Presentation {
    return this.section.presentation;
  }

  replaceView(view: SectionView): void {
    this.requiredView.destroy();
    this.initializeView(view);
  }

  get sectionView(): SectionViewOwner {
    return this.section_;
  }

  layout({ scale, tx }: { scale: number; tx: number }): void {
    this.requiredView.layout({ scale, tx });
  }

  layoutAdded(layout: Layout, copyFrom: Layout): void {
    super.layoutAdded(layout, copyFrom);
  }
}
