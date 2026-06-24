import type {
  Presentation,
  PresentationOptions,
} from "../clientAPI/Presentation";
import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { LayoutManager } from "../clientAPI/LayoutManager";
import type { StyleRegistry } from "../clientAPI/styles/StyleRegistry";
import type { NamedElementStyle } from "../clientAPI/styles/NamedElementStyle";
import type { NamedSectionStyle } from "../clientAPI/styles/NamedSectionStyle";
import type { Layout } from "../clientAPI/Layout";
import type { Anchor } from "../anchors/Anchor";
import type {
  AnchorRef,
  PresentationMemento,
} from "../clientAPI/serialize/PresentationMemento";
import type { PresentationViewOwner } from "../viewAPI/PresentationViewOwner";
import type {
  PresentationView,
  PresentationViewFactory,
} from "../viewAPI/PresentationView";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import type { PresentationEventSource } from "../clientAPI/PresentationEvents";
import type { PresentationEvents } from "../clientAPI/PresentationEvents";
import type {
  ScrollTrigger,
  ScrollTriggerOptions,
} from "../clientAPI/ScrollTrigger";
import { CorePresentationRoot } from "./CorePresentationRoot";
import { CoreLayoutManager } from "./CoreLayoutManager";
import { CoreScrollTrigger } from "./CoreScrollTrigger";
import { CoreStyleRegistry } from "./CoreStyleRegistry";
import { NullPresentationView } from "./nullView/NullPresentationView";
import { ConcreteAnchor } from "../anchors/ConcreteAnchor";
import { DerivedAnchorExpression } from "../anchors/expressions/DerivedAnchorExpression";
import { EventController } from "../common/EventController";
import { EventContext } from "./EventContext";
import type { SerializeContext } from "./serialize/SerializeContext";

const DEFAULT_BASIS_WIDTH = 1000;
const DEFAULT_BASIS_HEIGHT = 1000;

/**
 * Concrete implementation of Presentation and PresentationViewOwner.
 *
 * The top-level holder object. Owns CorePresentationRoot (the document tree)
 * and CoreLayoutManager (layout switching). Drives the view lifecycle cascade
 * and the layout pass cascade.
 */
export class CorePresentation implements Presentation, PresentationViewOwner {
  private readonly root_: CorePresentationRoot;
  private readonly layout_: CoreLayoutManager;
  private readonly eventController_: EventController<PresentationEvents>;
  private readonly eventContext_: EventContext;
  private readonly triggers_: CoreScrollTrigger[] = [];
  private readonly styles_: CoreStyleRegistry;
  private view_: PresentationView = new NullPresentationView();
  private layoutTransform_: LayoutTransform = { scale: 1, tx: 0 };
  // True while a requestAnimationFrame-scheduled layout pass is pending.
  // Guards against stacking multiple rAF callbacks when many anchors:changed
  // events fire in the same synchronous call stack.
  private layoutScheduled_ = false;

  // ── Viewport tracking ────────────────────────────────────────────────────
  // basisWidth_ and basisHeight_ are set from the default layout and used to
  // compute scale when the physical viewport changes.
  private readonly basisWidth_: number;
  private readonly basisHeight_: number;
  // Initialised to basis dimensions so the first layout pass is 1:1 before
  // any notifyViewResized call arrives.
  private physicalWidth_: number;
  private physicalHeight_: number;
  // scale_ = min(physicalWidth/basisWidth, physicalHeight/basisHeight).
  // Starts at 1 (1:1 mapping) to match physical == basis dimensions.
  private scale_: number = 1;

  /**
   * Live anchors for the visible viewport in basis-space coordinates.
   * All four update automatically when notifyViewResized is called.
   *
   * viewportLeft / viewportRight are 0 / basisWidth in the width-constrained
   * (landscape) case; they become negative / > basisWidth when the canvas is
   * narrower than the physical viewport (pillarbox / portrait layout).
   */
  readonly viewportWidthAnchor: ConcreteAnchor;
  readonly viewportHeightAnchor: ConcreteAnchor;
  readonly viewportLeftAnchor: ConcreteAnchor;
  readonly viewportRightAnchor: ConcreteAnchor;

  constructor(options: PresentationOptions = {}) {
    this.layout_ = new CoreLayoutManager({
      basisWidth: options.basisWidth ?? DEFAULT_BASIS_WIDTH,
      basisHeight: options.basisHeight ?? DEFAULT_BASIS_HEIGHT,
    });

    const defaultLayout = this.layout_.defaultLayout;
    this.basisWidth_ = defaultLayout.basisWidth;
    this.basisHeight_ = defaultLayout.basisHeight;
    this.physicalWidth_ = this.basisWidth_;
    this.physicalHeight_ = this.basisHeight_;

    // Evaluators close over this instance's mutable fields so all four anchors
    // stay live across notifyViewResized calls without replacing the expressions.
    // Empty dependency list: these depend on physical viewport state, not other
    // anchors, so there are no anchor-graph cycles to worry about.
    this.viewportWidthAnchor = new ConcreteAnchor(
      new DerivedAnchorExpression(
        [],
        () =>
          this.scale_ > 0
            ? this.physicalWidth_ / this.scale_
            : this.basisWidth_,
        "viewportWidth=physicalWidth/scale",
      ),
    );
    this.viewportHeightAnchor = new ConcreteAnchor(
      new DerivedAnchorExpression(
        [],
        () =>
          this.scale_ > 0
            ? this.physicalHeight_ / this.scale_
            : this.basisHeight_,
        "viewportHeight=physicalHeight/scale",
      ),
    );
    // viewportLeft is negative when the canvas is pillarboxed (viewport wider than canvas).
    this.viewportLeftAnchor = new ConcreteAnchor(
      new DerivedAnchorExpression(
        [],
        () => -(this.viewportWidthAnchor.value - this.basisWidth_) / 2,
        "viewportLeft=-(viewportWidth-basisWidth)/2",
      ),
    );
    this.viewportRightAnchor = new ConcreteAnchor(
      new DerivedAnchorExpression(
        [],
        () =>
          this.basisWidth_ +
          (this.viewportWidthAnchor.value - this.basisWidth_) / 2,
        "viewportRight=basisWidth+(viewportWidth-basisWidth)/2",
      ),
    );

    this.eventController_ = new EventController<PresentationEvents>();
    this.eventContext_ = new EventContext(this.eventController_);

    this.styles_ = new CoreStyleRegistry({
      onElementStylesChanged: () => this.onAllElementStylesChanged_(),
      onSectionStylesChanged: () => this.onAllSectionStylesChanged_(),
      isElementStyleInUse: (style) => this.isElementStyleInUse_(style),
      isSectionStyleInUse: (style) => this.isSectionStyleInUse_(style),
      onElementStyleCreated: (style) =>
        this.eventController_.emit("style:elementStyleCreated", { style }),
      onElementStyleDeleted: (style) =>
        this.eventController_.emit("style:elementStyleDeleted", { style }),
      onElementStyleRenamed: (style) =>
        this.eventController_.emit("style:elementStyleRenamed", { style }),
      onSectionStyleCreated: (style) =>
        this.eventController_.emit("style:sectionStyleCreated", { style }),
      onSectionStyleDeleted: (style) =>
        this.eventController_.emit("style:sectionStyleDeleted", { style }),
      onSectionStyleRenamed: (style) =>
        this.eventController_.emit("style:sectionStyleRenamed", { style }),
    });

    this.root_ = new CorePresentationRoot(this);

    // Wire the layout-added callback to cascade new layouts through the document
    // tree, all registered scroll triggers, and emit the layout:added event.
    this.layout_.setLayoutAddedCallback((layout) => {
      this.root_.onLayoutAdded(layout);
      for (const trigger of this.triggers_) {
        trigger.onLayoutAdded(layout);
      }
      this.eventController_.emit("layout:added", { layout });
    });

    this.layout_.setLayoutActiveChangedCallback((layout) => {
      this.eventController_.emit("layout:activeChanged", { layout });
    });

    // Schedule a layout pass whenever any anchor value changes. Multiple events
    // emitted in a single synchronous call stack (e.g. the BFS propagation in
    // emitAnchorChanged) collapse into one rAF-batched pass.
    //
    // TODO: targeted relayout — anchors:changed carries the affected owner and
    // EventContext's BFS already identifies the full transitive affected set.
    // In principle only those sections/elements need re-layout, not the whole
    // tree. Requires either returning the affected set from emitAnchorChanged
    // or restructuring how performLayout is dispatched through the tree.
    this.eventController_.on("anchors:changed", () => this.scheduleLayout_());
  }

  // ── Presentation (clientAPI) ──────────────────────────────────────────────

  get root(): PresentationRoot {
    return this.root_;
  }

  get layout(): LayoutManager {
    return this.layout_;
  }

  get events(): PresentationEventSource {
    return this.eventController_;
  }

  get styles(): StyleRegistry {
    return this.styles_;
  }

  get triggers(): readonly ScrollTrigger[] {
    return this.triggers_;
  }

  addScrollTrigger(options: ScrollTriggerOptions): ScrollTrigger {
    const trigger = new CoreScrollTrigger(
      this.layout_,
      this.eventContext_,
      options,
    );
    const index = this.triggers_.length;
    this.triggers_.push(trigger);
    this.eventController_.emit("trigger:added", { trigger, index });
    return trigger;
  }

  toMemento(): PresentationMemento {
    const layouts = this.layout_.layouts;
    const anchorLookups = layouts.map((layout) =>
      this.buildAnchorLookup_(layout),
    );
    const triggerIndex: ReadonlyMap<ScrollTrigger, number> = new Map(
      this.triggers_.map((t, i) => [t, i] as const),
    );
    const ctx: SerializeContext = { layouts, anchorLookups, triggerIndex };
    // TODO: styles not yet serialized — PresentationMemento needs elementStyles,
    // sectionStyles, globalElementStyle, globalSectionStyle, and per-element/section
    // ownStyle and namedStyles (stored as name strings, re-linked by object on load).
    return {
      version: 1,
      layouts: layouts.map((l) => ({
        basisWidth: l.basisWidth,
        basisHeight: l.basisHeight,
      })),
      triggers: this.triggers_.map((t) => t.toMemento(ctx)),
      sections: this.root_.coreSections.map((s) => s.toMemento(ctx)),
    };
  }

  private buildAnchorLookup_(layout: Layout): Map<Anchor, AnchorRef> {
    const lookup = new Map<Anchor, AnchorRef>();
    // Root XYAnchors plus all sections and elements
    this.root_.addToAnchorLookup(layout, lookup);
    // Viewport anchors are single ConcreteAnchor instances shared across all layouts
    lookup.set(this.viewportWidthAnchor, {
      node: "root",
      slot: "viewportWidth",
    });
    lookup.set(this.viewportHeightAnchor, {
      node: "root",
      slot: "viewportHeight",
    });
    lookup.set(this.viewportLeftAnchor, { node: "root", slot: "viewportLeft" });
    lookup.set(this.viewportRightAnchor, {
      node: "root",
      slot: "viewportRight",
    });
    // Triggers
    this.triggers_.forEach((t, i) => t.addToAnchorLookup(layout, i, lookup));
    return lookup;
  }

  // ── Internal accessors for the Core* tree ────────────────────────────────

  get eventContext(): EventContext {
    return this.eventContext_;
  }

  get coreStyleRegistry(): CoreStyleRegistry {
    return this.styles_;
  }

  private isElementStyleInUse_(style: NamedElementStyle): boolean {
    return this.root_.coreSections.some((section) =>
      section.coreElements.some((element) => element.named.includes(style)),
    );
  }

  private isSectionStyleInUse_(style: NamedSectionStyle): boolean {
    return this.root_.coreSections.some((section) =>
      section.named.includes(style),
    );
  }

  private onAllElementStylesChanged_(): void {
    this.eventController_.beginSession();
    for (const section of this.root_.coreSections) {
      for (const element of section.coreElements) {
        element.notifyStyleRegistryChanged();
      }
    }
    this.eventController_.endSession();
  }

  private onAllSectionStylesChanged_(): void {
    this.eventController_.beginSession();
    for (const section of this.root_.coreSections) {
      section.notifyStyleRegistryChanged();
    }
    this.eventController_.endSession();
  }

  // ── PresentationViewOwner (viewAPI) ──────────────────────────────────────

  get layoutTransform(): LayoutTransform {
    return this.layoutTransform_;
  }

  notifyScrolled(scrollY: number): void {
    for (const trigger of this.triggers_) {
      trigger.onScroll(scrollY);
    }
  }

  requestLayout(): void {
    // Clear the flag so the pending rAF callback (if any) becomes a no-op,
    // avoiding a redundant second layout pass after this synchronous one.
    this.layoutScheduled_ = false;
    this.performLayout();
  }

  private scheduleLayout_(): void {
    if (this.layoutScheduled_) return;
    this.layoutScheduled_ = true;
    requestAnimationFrame(() => {
      this.layoutScheduled_ = false;
      this.performLayout();
    });
  }

  notifyViewResized(physicalWidth: number, physicalHeight: number): void {
    // scale = largest uniform scale that fits the basis page slot inside the
    // physical viewport (contain-fit, same as CSS object-fit: contain).
    this.physicalWidth_ = physicalWidth;
    this.physicalHeight_ = physicalHeight;
    const scaleX = physicalWidth / this.basisWidth_;
    const scaleY = physicalHeight / this.basisHeight_;
    this.scale_ = Math.min(scaleX, scaleY);
    this.performLayout();
  }

  // ── View lifecycle ───────────────────────────────────────────────────────

  attachView(factory: PresentationViewFactory): void {
    this.view_.destroy();
    this.view_ = factory(this);
    this.root_.attachView(this.view_);

    // Initialize scale and run the first layout pass from the new view's dimensions.
    this.notifyViewResized(this.view_.width, this.view_.height);
  }

  private performLayout(): void {
    const tx = (this.physicalWidth_ - this.basisWidth_ * this.scale_) / 2;
    this.layoutTransform_ = { scale: this.scale_, tx };
    // Phase 1: PresentationView receives the transform (scroll container sizing etc.)
    this.view_.layout(this.layoutTransform_);
    // Phase 2 (write): apply the constrained dimension to all content-dependent elements.
    // All writes happen before any reads to avoid read-write interleaving reflows.
    this.root_.performMeasureApply(this.layoutTransform_);
    // Phase 3 (read): measure each content-dependent element and feed the result back
    // into its size anchor via notifyMeasuredSize. Anchor values are now fully populated.
    this.root_.performMeasureFeedback();
    // Phase 4: normal layout cascade with all anchor values known.
    this.root_.performLayout(this.layoutTransform_);
  }
}
