import type { Section } from "../clientAPI/Section";
import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { Element } from "../clientAPI/Element";
import type { Layout } from "../clientAPI/Layout";
import type { LayoutManager } from "../clientAPI/LayoutManager";
import type { VerticalAnchorSet } from "../anchors/AnchorSet";
import type { MarkdownElement } from "../clientAPI/elements/MarkdownElement";
import type { BitmapImageElement } from "../clientAPI/elements/BitmapImageElement";
import type { SVGImageElement } from "../clientAPI/elements/SVGImageElement";
import type { SectionAnimations } from "../clientAPI/animation/SectionAnimations";
import type { Anchor } from "../anchors/Anchor";
import type {
  AnchorRef,
  SectionMemento,
} from "../clientAPI/serialize/PresentationMemento";
import type {
  SectionStyleProps,
  ComputedSectionStyle,
  SectionStyles,
} from "../clientAPI/styles/SectionStyleProps";
import type { NamedSectionStyle } from "../clientAPI/styles/NamedSectionStyle";
import type { CoreStyleRegistry } from "./CoreStyleRegistry";
import type { PresentationView } from "../viewAPI/PresentationView";
import type { SectionView } from "../viewAPI/SectionView";
import type { SectionViewOwner } from "../viewAPI/SectionViewOwner";
import type { PresentationViewOwner } from "../viewAPI/PresentationViewOwner";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import type { ConcreteXYAnchors } from "../anchors/ConcreteXYAnchors";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { NullSectionView } from "./nullView/NullSectionView";
import { resolveSectionStyle } from "./styles/styleResolver";
import { CoreMarkdownElement } from "./elements/CoreMarkdownElement";
import { CoreBitmapImageElement } from "./elements/CoreBitmapImageElement";
import { CoreSVGImageElement } from "./elements/CoreSVGImageElement";
import { CoreSectionAnimations } from "./animation/CoreSectionAnimations";
import type { CorePresentationRoot } from "./CorePresentationRoot";
import type { CoreElement } from "./CoreElement";
import type { EventContext } from "./EventContext";
import {
  ANCHOR_SLOTS,
  type SerializeContext,
} from "./serialize/SerializeContext";
import { serializeSectionLayoutGeometry } from "./serialize/serializeGeometry";
import { serializeSectionStyles } from "./serialize/serializeStyles";

/**
 * Concrete implementation of Section and SectionViewOwner.
 *
 * Owned by CorePresentationRoot. Owns CoreElement instances. Manages the section
 * view lifecycle: starts with a NullSectionView and receives a real view when
 * CorePresentationRoot.attachView() cascades down the tree.
 */
export class CoreSection
  extends AnchoredObjectBase
  implements Section, SectionViewOwner, SectionStyles
{
  private readonly root_: CorePresentationRoot;
  private readonly eventContext_: EventContext;
  private name_: string;
  private readonly elements_: CoreElement[] = [];
  private readonly nextElementTypeIds_: Record<string, number> = {};
  private view_: SectionView;
  private readonly animations_: CoreSectionAnimations;
  private ownStyle_: SectionStyleProps = {};
  private namedStyles_: NamedSectionStyle[] = [];
  private computedStyle_: ComputedSectionStyle;

  constructor(root: CorePresentationRoot, name: string) {
    super(root.layoutContext);
    this.root_ = root;
    this.eventContext_ = root.eventContext;
    this.name_ = name;
    this.view_ = new NullSectionView();
    this.animations_ = new CoreSectionAnimations(this, this.eventContext_);
    // Register the initial bag created during super().
    this.eventContext_.registerAnchors(this.anchors, this);
    this.computedStyle_ = this.buildComputedStyle_();
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
    this.view_.applyStyle(this.computedStyle_);
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

  get name(): string {
    return this.name_;
  }

  setName(name: string): void {
    const isDuplicate = this.root_.coreSections.some(
      (s) => s !== this && s.name === name,
    );
    if (isDuplicate)
      throw new Error(`Section name "${name}" is already in use.`);
    this.name_ = name;
    this.eventContext_.emit("section:nameChanged", { section: this, name });
  }

  get animations(): SectionAnimations {
    return this.animations_;
  }

  get styles(): SectionStyles {
    return this;
  }

  get computed(): ComputedSectionStyle {
    return this.computedStyle_;
  }

  get own(): SectionStyleProps {
    return this.ownStyle_;
  }

  set(style: SectionStyleProps): void {
    this.ownStyle_ = style;
    this.recomputeAndPushStyle_();
  }

  addNamed(style: NamedSectionStyle): void {
    if (!this.namedStyles_.includes(style)) {
      this.namedStyles_.push(style);
      this.recomputeAndPushStyle_();
    }
  }

  removeNamed(style: NamedSectionStyle): void {
    const index = this.namedStyles_.indexOf(style);
    if (index >= 0) {
      this.namedStyles_.splice(index, 1);
      this.recomputeAndPushStyle_();
    }
  }

  get named(): ReadonlyArray<NamedSectionStyle> {
    return this.namedStyles_;
  }

  setVerticalAnchors(descriptor: VerticalAnchorSet): void {
    this.setVerticalAnchors_(descriptor);
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.top, a.bottom, a.height], this);
  }

  private generateElementName_(type: string): string {
    const n = (this.nextElementTypeIds_[type] ?? 0) + 1;
    this.nextElementTypeIds_[type] = n;
    return `${type} ${n}`;
  }

  addMarkdownElement(markdown = ""): MarkdownElement {
    const element = new CoreMarkdownElement(
      this,
      this.generateElementName_("Markdown"),
      markdown,
    );
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
    const element = new CoreBitmapImageElement(
      this,
      this.generateElementName_("Bitmap"),
    );
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
    const element = new CoreSVGImageElement(
      this,
      this.generateElementName_("SVG"),
    );
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

  // ── Internal style helpers ────────────────────────────────────────────────

  /** Exposes the style registry so CoreElement can resolve cascades. */
  get styleRegistry(): CoreStyleRegistry {
    return this.root_.styleRegistry;
  }

  /** Called by CorePresentation when any section-level registry entry changes. */
  notifyStyleRegistryChanged(): void {
    this.recomputeAndPushStyle_();
  }

  private recomputeAndPushStyle_(): void {
    this.computedStyle_ = this.buildComputedStyle_();
    this.view_.applyStyle(this.computedStyle_);
    this.eventContext_.emit("section:styleChanged", { section: this });
  }

  private buildComputedStyle_(): ComputedSectionStyle {
    const registry = this.root_.styleRegistry;
    return resolveSectionStyle({
      own: this.ownStyle_,
      named: this.namedStyles_.map((s) => s.props),
      authorGlobal: registry.globalSectionStyle,
    });
  }

  // ── Internal serialization helpers ───────────────────────────────────────

  get coreElements(): readonly CoreElement[] {
    return this.elements_;
  }

  addToAnchorLookup(
    layout: Layout,
    sectionIndex: number,
    lookup: Map<Anchor, AnchorRef>,
  ): void {
    const bag = this.getLayoutBag_(layout);
    if (bag) {
      for (const slot of ANCHOR_SLOTS) {
        lookup.set(bag[slot], { node: "section", index: sectionIndex, slot });
      }
    }
    this.elements_.forEach((el, ei) =>
      el.addToAnchorLookup(layout, { sectionIndex, elementIndex: ei }, lookup),
    );
  }

  toMemento(ctx: SerializeContext): SectionMemento {
    return {
      name: this.name_,
      layouts: ctx.layouts.map((layout, li) => {
        const bag = this.getLayoutBag_(layout);
        if (!bag) throw new Error("CoreSection.toMemento: missing layout bag.");
        return serializeSectionLayoutGeometry(
          bag,
          this.isVerticalGeometrySet_(layout),
          ctx.anchorLookups[li]!,
        );
      }),
      keyFrameAnimations: this.animations_.toMemento(ctx.triggerIndex),
      elements: this.elements_.map((el) => el.toMemento(ctx)),
      ...serializeSectionStyles(this.ownStyle_, this.namedStyles_),
    };
  }
}
