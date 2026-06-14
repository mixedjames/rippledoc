import type {
  Presentation,
  PresentationOptions,
} from "../clientAPI/Presentation";
import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { LayoutManager } from "../clientAPI/LayoutManager";
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
import { NullPresentationView } from "./nullView/NullPresentationView";
import { ConcreteAnchor } from "../anchors/ConcreteAnchor";
import { DerivedAnchorExpression } from "../anchors/expressions/DerivedAnchorExpression";
import { EventController } from "../common/EventController";
import { EventContext } from "./EventContext";

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
  private view_: PresentationView = new NullPresentationView();
  private layoutTransform_: LayoutTransform = { scale: 1, tx: 0 };

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

  addScrollTrigger(options: ScrollTriggerOptions): ScrollTrigger {
    const trigger = new CoreScrollTrigger(this.layout_, options);
    this.triggers_.push(trigger);
    return trigger;
  }

  // ── Internal accessors for the Core* tree ────────────────────────────────

  get eventContext(): EventContext {
    return this.eventContext_;
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
    this.view_.layout(this.layoutTransform_);
    this.root_.performLayout(this.layoutTransform_);
  }
}
