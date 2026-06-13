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
import { CorePresentationRoot } from "./CorePresentationRoot";
import { CoreLayoutManager } from "./CoreLayoutManager";
import { NullPresentationView } from "./nullView/NullPresentationView";
import { ConcreteAnchor } from "../anchors/ConcreteAnchor";
import { DerivedAnchorExpression } from "../anchors/expressions/DerivedAnchorExpression";

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
  private view_: PresentationView = new NullPresentationView();
  private layoutTransform_: LayoutTransform = { scale: 1, tx: 0 };

  // ── Viewport tracking ────────────────────────────────────────────────────
  // basisWidth_ and basisHeight_ are set from the default layout and used to
  // compute scale when the physical viewport changes.
  private readonly basisWidth_: number;
  private readonly basisHeight_: number;
  // Initialised to basisHeight so the anchor has a meaningful value before any
  // notifyViewResized call (1:1 mapping, scale=1).
  private physicalHeight_: number;
  // scale_ = min(physicalWidth/basisWidth, physicalHeight/basisHeight).
  // Starts at 1 (1:1 mapping) to match physicalHeight_ == basisHeight_.
  private scale_: number = 1;

  /**
   * A live anchor whose value equals the current viewport height in virtual
   * basis-space coordinates: physicalHeight / scale.
   *
   * Use it as the `height` expression for any element that should fill the
   * visible viewport (e.g. a full-bleed slide). The value updates automatically
   * when notifyViewResized is called.
   */
  readonly viewportHeightAnchor: ConcreteAnchor;

  constructor(options: PresentationOptions = {}) {
    this.layout_ = new CoreLayoutManager({
      basisWidth: options.basisWidth ?? DEFAULT_BASIS_WIDTH,
      basisHeight: options.basisHeight ?? DEFAULT_BASIS_HEIGHT,
    });

    const defaultLayout = this.layout_.defaultLayout;
    this.basisWidth_ = defaultLayout.basisWidth;
    this.basisHeight_ = defaultLayout.basisHeight;
    this.physicalHeight_ = this.basisHeight_;

    // The evaluator closes over this instance's mutable fields so the anchor
    // stays live across notifyViewResized calls without replacing the expression.
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

    this.root_ = new CorePresentationRoot(this);

    // Wire the layout-added callback to cascade new layouts through the document tree.
    //
    // Each anchored object copies its CURRENTLY ACTIVE layout's values as constants
    // into the new layout's bag. If addLayout() is called while a non-default layout
    // is active, the new layout inherits from that one, not from the default.
    //
    // TODO: In future this could be user selectable?
    //
    this.layout_.setLayoutAddedCallback((layout) =>
      this.root_.onLayoutAdded(layout),
    );
  }

  // ── Presentation (clientAPI) ──────────────────────────────────────────────

  get root(): PresentationRoot {
    return this.root_;
  }

  get layout(): LayoutManager {
    return this.layout_;
  }

  // ── PresentationViewOwner (viewAPI) ──────────────────────────────────────

  get layoutTransform(): LayoutTransform {
    return this.layoutTransform_;
  }

  notifyViewResized(physicalWidth: number, physicalHeight: number): void {
    // scale = largest uniform scale factor that fits the basis canvas inside the
    // physical viewport (contain-fit, same as CSS object-fit: contain).
    const scaleX = physicalWidth / this.basisWidth_;
    const scaleY = physicalHeight / this.basisHeight_;
    this.scale_ = Math.min(scaleX, scaleY);
    this.physicalHeight_ = physicalHeight;
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
    // TODO: compute layoutTransform_ from physical dimensions via ScaleHelper.
    this.view_.layout(this.layoutTransform_);
    this.root_.performLayout(this.layoutTransform_);
  }
}
