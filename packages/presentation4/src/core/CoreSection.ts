import type { Section } from "../clientAPI/Section";
import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { Element } from "../clientAPI/Element";
import type { Layout } from "../clientAPI/Layout";
import type { LayoutManager } from "../clientAPI/LayoutManager";
import type { VerticalAnchorSet } from "../anchors/AnchorSet";
import type { MarkdownElement } from "../clientAPI/elements/MarkdownElement";
import type { BitmapImageElement } from "../clientAPI/elements/BitmapImageElement";
import type { SVGImageElement } from "../clientAPI/elements/SVGImageElement";
import type { PresentationView } from "../viewAPI/PresentationView";
import type { SectionView } from "../viewAPI/SectionView";
import type { SectionViewOwner } from "../viewAPI/SectionViewOwner";
import type { PresentationViewOwner } from "../viewAPI/PresentationViewOwner";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import type { ConcreteXYAnchors } from "../anchors/ConcreteXYAnchors";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { NullSectionView } from "./nullView/NullSectionView";
import { CoreMarkdownElement } from "./elements/CoreMarkdownElement";
import { CoreBitmapImageElement } from "./elements/CoreBitmapImageElement";
import { CoreSVGImageElement } from "./elements/CoreSVGImageElement";
import type { CorePresentationRoot } from "./CorePresentationRoot";
import type { CoreElement } from "./CoreElement";
import type { EventContext } from "./EventContext";

/**
 * Concrete implementation of Section and SectionViewOwner.
 *
 * Owned by CorePresentationRoot. Owns CoreElement instances. Manages the section
 * view lifecycle: starts with a NullSectionView and receives a real view when
 * CorePresentationRoot.attachView() cascades down the tree.
 */
export class CoreSection
  extends AnchoredObjectBase
  implements Section, SectionViewOwner
{
  private readonly root_: CorePresentationRoot;
  private readonly eventContext_: EventContext;
  private readonly elements_: CoreElement[] = [];
  private view_: SectionView;

  constructor(root: CorePresentationRoot) {
    super(root.layoutContext);
    this.root_ = root;
    this.eventContext_ = root.eventContext;
    this.view_ = new NullSectionView();
    // Register the initial bag created during super().
    this.eventContext_.registerAnchors(this.anchors, this);
  }

  /** Exposes the LayoutManager so CoreElement can thread it to AnchoredObjectBase. */
  get layoutContext(): LayoutManager {
    return this.root_.layoutContext;
  }

  /** Exposes EventContext so CoreElement can access it via the section reference. */
  get eventContext(): EventContext {
    return this.eventContext_;
  }

  protected override onBagCreated_(bag: ConcreteXYAnchors): void {
    this.eventContext_.registerAnchors(bag, this);
  }

  /** Called by CorePresentationRoot when a layout is added to the LayoutManager. */
  onLayoutAdded(layout: Layout): void {
    this.initLayoutEntry_(layout);
    this.elements_.forEach((e) => e.onLayoutAdded(layout));
  }

  /** Called by CorePresentationRoot when a view is being attached. */
  attachView(presentationView: PresentationView): void {
    this.view_ = presentationView.createSectionView(this);
    this.elements_.forEach((e) => e.attachView(this.view_));
  }

  /**
   * Called by CorePresentationRoot.removeSection. Delegates entirely to
   * this.view_.destroy(), which cascades to all element views per the
   * SectionView.destroy() ownership contract (see PresentationView.destroy()).
   */
  detachView(): void {
    this.view_.destroy();
  }

  /** Called by CorePresentationRoot during layout passes. */
  performLayout(transform: LayoutTransform): void {
    this.view_.layout(transform);
    this.elements_.forEach((e) => e.performLayout(transform));
  }

  /** Write phase of content-dependent layout: applies the constrained dimension to each auto element. */
  performMeasureApply(transform: LayoutTransform): void {
    this.elements_.forEach((e) => e.performMeasureApply(transform));
  }

  /** Read phase of content-dependent layout: measures each auto element and feeds the result back. */
  performMeasureFeedback(): void {
    this.elements_.forEach((e) => e.performMeasureFeedback());
  }

  // ── Section (clientAPI) ──────────────────────────────────────────────────

  get root(): PresentationRoot {
    return this.root_;
  }

  setVerticalAnchors(descriptor: VerticalAnchorSet): void {
    this.setVerticalAnchors_(descriptor);
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.top, a.bottom, a.height], this);
  }

  addMarkdownElement(markdown = ""): MarkdownElement {
    const element = new CoreMarkdownElement(this, markdown);
    element.attachView(this.view_);
    this.elements_.push(element);
    this.eventContext_.emit("element:added", {
      element,
      section: this,
      index: this.elements_.length - 1,
    });
    return element;
  }

  addBitmapImageElement(): BitmapImageElement {
    const element = new CoreBitmapImageElement(this);
    element.attachView(this.view_);
    this.elements_.push(element);
    this.eventContext_.emit("element:added", {
      element,
      section: this,
      index: this.elements_.length - 1,
    });
    return element;
  }

  addSVGImageElement(): SVGImageElement {
    const element = new CoreSVGImageElement(this);
    element.attachView(this.view_);
    this.elements_.push(element);
    this.eventContext_.emit("element:added", {
      element,
      section: this,
      index: this.elements_.length - 1,
    });
    return element;
  }

  getElements(): readonly Element[] {
    return this.elements_;
  }

  removeElement(element: Element): void {
    const index = this.elements_.findIndex((e) => e === element);
    if (index < 0) throw new Error("Element does not belong to this section.");
    const coreElement = this.elements_[index]!;
    this.elements_.splice(index, 1);
    coreElement.detachView();
    this.eventContext_.emit("element:removed", {
      element,
      section: this,
      index,
    });
  }

  // ── SectionViewOwner (viewAPI) ───────────────────────────────────────────

  get presentationViewOwner(): PresentationViewOwner {
    return this.root_.presentationViewOwner;
  }
}
