import type { Presentation } from "../clientAPI/Presentation";
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

const DEFAULT_BASIS_WIDTH = 1000;
const DEFAULT_BASIS_HEIGHT = 1000;

export interface PresentationOptions {
  basisWidth?: number;
  basisHeight?: number;
}

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

  constructor(options: PresentationOptions = {}) {
    this.layout_ = new CoreLayoutManager({
      basisWidth: options.basisWidth ?? DEFAULT_BASIS_WIDTH,
      basisHeight: options.basisHeight ?? DEFAULT_BASIS_HEIGHT,
    });
    this.root_ = new CorePresentationRoot(this);
  }

  // ── Presentation (clientAPI) ─────────────────────────────────────────────

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notifyViewResized(physicalWidth: number, physicalHeight: number): void {
    // physicalWidth / physicalHeight will feed ScaleHelper once implemented.
    this.performLayout();
  }

  // ── View lifecycle ───────────────────────────────────────────────────────

  attachView(factory: PresentationViewFactory): void {
    this.view_.destroy();
    this.view_ = factory(this);
    this.root_.attachView(this.view_);
    this.performLayout();
  }

  private performLayout(): void {
    // TODO: compute layoutTransform_ from physical dimensions via ScaleHelper.
    this.view_.layout(this.layoutTransform_);
    this.root_.performLayout(this.layoutTransform_);
  }
}
