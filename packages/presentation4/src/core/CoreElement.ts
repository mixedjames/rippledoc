import type { Element, ContentDependentDimension } from "../clientAPI/Element";
import type { Section } from "../clientAPI/Section";
import type { Layout } from "../clientAPI/Layout";
import type { AnchorExpression, Anchor } from "../anchors/Anchor";
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
import type { ElementAnimations } from "../clientAPI/animation/ElementAnimations";
import type {
  AnchorRef,
  ElementMemento,
  ElementLayoutGeometryMemento,
} from "../clientAPI/serialize/PresentationMemento";
import type {
  ElementStyleProps,
  ComputedElementStyle,
  ElementStyles,
} from "../clientAPI/styles/ElementStyleProps";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { NullElementView } from "./nullView/NullElementView";
import { DerivedAnchorExpression } from "../anchors/expressions/DerivedAnchorExpression";
import { GeometryConstraintError } from "../anchors/GeometryConstraintError";
import { CoreElementAnimations } from "./animation/CoreElementAnimations";
import { resolveElementStyle } from "./styles/styleResolver";
import type { CoreSection } from "./CoreSection";
import type { EventContext } from "./EventContext";
import {
  ANCHOR_SLOTS,
  type SerializeContext,
} from "./serialize/SerializeContext";
import { serializeElementLayoutGeometry } from "./serialize/serializeGeometry";

/**
 * Abstract base for all concrete element types.
 *
 * Owns the shared lifecycle: anchor storage (via AnchoredObjectBase), view
 * management (null view until a real view is attached), and the layout pass.
 * Concrete subclasses supply createView() and any content-specific state.
 */
export abstract class CoreElement
  extends AnchoredObjectBase
  implements Element, ElementViewOwner, ElementStyles
{
  private readonly section_: CoreSection;
  protected readonly eventContext_: EventContext;
  private view_: ElementView;
  private readonly animations_: CoreElementAnimations;
  private ownStyle_: ElementStyleProps = {};
  private namedStyles_: string[] = [];
  private computedStyle_: ComputedElementStyle;

  // ── Content-dependent dimension state ────────────────────────────────────
  //
  // When one axis is auto, the core owns a private mutable box that the view
  // writes to via notifyMeasuredSize(). The DerivedAnchorExpression for the
  // size anchor closes over the box so dependents see the updated value on
  // the next layout pass without any further wiring.
  private contentDependentDimension_: ContentDependentDimension = "none";
  private measuredWidthBox_: { value: number } | null = null;
  private measuredHeightBox_: { value: number } | null = null;

  constructor(section: CoreSection) {
    super(section.layoutContext);
    this.section_ = section;
    this.eventContext_ = section.eventContext;
    this.view_ = new NullElementView();
    this.animations_ = new CoreElementAnimations(this, this.eventContext_);
    // Register the initial bag created during super().
    this.eventContext_.registerAnchors(this.anchors, this);
    this.computedStyle_ = this.buildComputedStyle_();
  }

  /** Called by CoreSection when a layout is added to the LayoutManager. */
  onLayoutAdded(layout: Layout): void {
    this.initLayoutEntry_(layout);
  }

  /** Called by CoreSection when a view is being attached. */
  attachView(sectionView: SectionView): void {
    this.view_ = this.createView(sectionView);
    this.view_.applyStyle(this.computedStyle_);
  }

  /** Called by CoreSection.removeElement. Destroys this element's view. */
  detachView(): void {
    this.view_.destroy();
  }

  /** Called by CoreSection during the normal layout pass. */
  performLayout(transform: LayoutTransform): void {
    this.view_.layout(transform);
  }

  /** Called by CoreSection during the write phase of content-dependent layout. */
  performMeasureApply(transform: LayoutTransform): void {
    if (this.contentDependentDimension_ === "none") return;
    this.view_.applyConstrainedDimension(transform);
  }

  /** Called by CoreSection during the read phase of content-dependent layout. */
  performMeasureFeedback(): void {
    if (this.contentDependentDimension_ === "none") return;
    this.view_.measureAndReport();
  }

  protected abstract createView(sectionView: SectionView): ElementView;

  abstract toMemento(ctx: SerializeContext): ElementMemento;

  addToAnchorLookup(
    layout: Layout,
    position: { sectionIndex: number; elementIndex: number },
    lookup: Map<Anchor, AnchorRef>,
  ): void {
    const bag = this.getLayoutBag_(layout);
    if (!bag) return;
    const { sectionIndex, elementIndex } = position;
    for (const slot of ANCHOR_SLOTS) {
      lookup.set(bag[slot], {
        node: "element",
        sectionIndex,
        elementIndex,
        slot,
      });
    }
  }

  /** Serializes the geometry and animation state common to all element types. */
  protected elementMementoBase_(ctx: SerializeContext): {
    layouts: readonly ElementLayoutGeometryMemento[];
    keyFrameAnimations: ReturnType<
      CoreElementAnimations["toMemento"]
    >["keyFrameAnimations"];
    pins: ReturnType<CoreElementAnimations["toMemento"]>["pins"];
  } {
    const { keyFrameAnimations, pins } = this.animations_.toMemento(
      ctx.triggerIndex,
    );
    return {
      layouts: ctx.layouts.map((layout, li) => {
        const bag = this.getLayoutBag_(layout);
        if (!bag) throw new Error("CoreElement.toMemento: missing layout bag.");
        return serializeElementLayoutGeometry(
          bag,
          {
            hIsSet: this.isHorizontalGeometrySet_(layout),
            vIsSet: this.isVerticalGeometrySet_(layout),
            contentDependentDimension: this.contentDependentDimension_,
          },
          ctx.anchorLookups[li]!,
        );
      }),
      keyFrameAnimations,
      pins,
    };
  }

  protected override onBagCreated_(bag: ConcreteXYAnchors): void {
    this.eventContext_.registerAnchors(bag, this);
  }

  // ── Element (clientAPI) ──────────────────────────────────────────────────

  get section(): Section {
    return this.section_;
  }

  get contentDependentDimension(): ContentDependentDimension {
    return this.contentDependentDimension_;
  }

  get animations(): ElementAnimations {
    return this.animations_;
  }

  get styles(): ElementStyles {
    return this;
  }

  get computed(): ComputedElementStyle {
    return this.computedStyle_;
  }

  get own(): ElementStyleProps {
    return this.ownStyle_;
  }

  set(style: ElementStyleProps): void {
    this.ownStyle_ = style;
    this.recomputeAndPushStyle_();
  }

  addNamed(name: string): void {
    if (!this.namedStyles_.includes(name)) {
      this.namedStyles_.push(name);
      this.recomputeAndPushStyle_();
    }
  }

  removeNamed(name: string): void {
    const index = this.namedStyles_.indexOf(name);
    if (index >= 0) {
      this.namedStyles_.splice(index, 1);
      this.recomputeAndPushStyle_();
    }
  }

  get named(): readonly string[] {
    return this.namedStyles_;
  }

  /** Called by CorePresentation when any element-level registry entry changes. */
  notifyStyleRegistryChanged(): void {
    this.recomputeAndPushStyle_();
  }

  private recomputeAndPushStyle_(): void {
    this.computedStyle_ = this.buildComputedStyle_();
    this.view_.applyStyle(this.computedStyle_);
    this.eventContext_.emit("element:styleChanged", { element: this });
  }

  private buildComputedStyle_(): ComputedElementStyle {
    const registry = this.section_.styleRegistry;
    const namedProps = this.namedStyles_.map(
      (name) => registry.lookupElementStyle(name) ?? {},
    );
    return resolveElementStyle({
      own: this.ownStyle_,
      named: namedProps,
      authorGlobal: registry.globalElementStyle,
    });
  }

  setHorizontalAnchors(descriptor: HorizontalAnchorSet): void {
    if (this.contentDependentDimension_ === "width") {
      this.contentDependentDimension_ = "none";
      this.measuredWidthBox_ = null;
    }
    this.setHorizontalAnchors_(descriptor);
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.left, a.right, a.width], this);
  }

  setVerticalAnchors(descriptor: VerticalAnchorSet): void {
    if (this.contentDependentDimension_ === "height") {
      this.contentDependentDimension_ = "none";
      this.measuredHeightBox_ = null;
    }
    this.setVerticalAnchors_(descriptor);
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.top, a.bottom, a.height], this);
  }

  setAutoHeight(
    options: { top: AnchorExpression } | { bottom: AnchorExpression },
  ): void {
    if (this.contentDependentDimension_ === "width") {
      throw new GeometryConstraintError(
        "Cannot set auto height: width is already content-dependent. At most one axis may be auto.",
      );
    }
    this.measuredHeightBox_ = { value: 0 };
    const box = this.measuredHeightBox_;
    const measuredExpr = new DerivedAnchorExpression(
      [],
      () => box.value,
      "measured:height",
    );
    const descriptor: VerticalAnchorSet =
      "top" in options
        ? { top: options.top, height: measuredExpr }
        : { bottom: options.bottom, height: measuredExpr };
    this.setVerticalAnchors_(descriptor);
    this.contentDependentDimension_ = "height";
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.top, a.bottom, a.height], this);
  }

  setAutoWidth(
    options: { left: AnchorExpression } | { right: AnchorExpression },
  ): void {
    if (this.contentDependentDimension_ === "height") {
      throw new GeometryConstraintError(
        "Cannot set auto width: height is already content-dependent. At most one axis may be auto.",
      );
    }
    this.measuredWidthBox_ = { value: 0 };
    const box = this.measuredWidthBox_;
    const measuredExpr = new DerivedAnchorExpression(
      [],
      () => box.value,
      "measured:width",
    );
    const descriptor: HorizontalAnchorSet =
      "left" in options
        ? { left: options.left, width: measuredExpr }
        : { right: options.right, width: measuredExpr };
    this.setHorizontalAnchors_(descriptor);
    this.contentDependentDimension_ = "width";
    const a = this.anchors;
    this.eventContext_.emitAnchorChanged([a.left, a.right, a.width], this);
  }

  // ── ElementViewOwner (viewAPI) ───────────────────────────────────────────

  get sectionViewOwner(): SectionViewOwner {
    return this.section_;
  }

  notifyMeasuredSize(size: number): void {
    if (this.contentDependentDimension_ === "height") {
      this.measuredHeightBox_!.value = size;
      this.eventContext_.emitAnchorChanged([this.anchors.height], this);
    } else if (this.contentDependentDimension_ === "width") {
      this.measuredWidthBox_!.value = size;
      this.eventContext_.emitAnchorChanged([this.anchors.width], this);
    }
  }
}
