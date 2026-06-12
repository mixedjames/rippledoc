import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import * as Anchors from "../../anchors/index";
import { Section, ConcreteSection } from "../section/Section";
import { PresentationView, PresentationViewOwner } from "./PresentationView";
import { NullPresentationView } from "../nullView/NullPresentationView";
import { ScaleHelper } from "./ScaleHelper";
import { Layout, ConcreteLayout } from "./Layout";
import { LayoutPicker } from "./LayoutPicker";

const DEFAULT_SLIDE_WIDTH = 1000;
const DEFAULT_SLIDE_HEIGHT = 1000;
const LAST_INDEX = -1;

export interface PresentationOptions {
  basisWidth?: number;
  basisHeight?: number;
}

export interface Presentation extends ConcreteAnchoredObjectBase {
  // Content management
  //

  addSection(): Section;
  getSections(): readonly Section[];

  // View management
  //

  replaceView(
    factory: (owner: PresentationViewOwner) => PresentationView,
  ): void;

  // Geometry management
  //

  get basisWidth(): number;
  get basisHeight(): number;
  get viewportHeight(): number;
  get viewportHeightAnchor(): Anchors.Anchor;

  get totalHeight(): number;

  get physicalGeometry(): { width: number; height: number; scale: number };

  // Layout management
  //

  addLayout(opts: { basisWidth: number; basisHeight: number }): Layout;

  get defaultLayout(): Layout;

  get activeLayout(): Layout;

  setActiveLayout(layout: Layout): void;

  get hasLayoutPicker(): boolean;

  get layoutPicker(): LayoutPicker;

  setLayoutPicker(layoutPicker: LayoutPicker): void;
}

export function createPresentation(
  options: PresentationOptions = {},
): Presentation {
  return new ConcretePresentation(options);
}

/**
 * Presentation is the root object of a presentation document tree.
 *
 * A presentation has:
 * - Geometry
 * - Sections, which contain elements
 * - Event listener registration endpoints
 *
 * ## Geometry
 *
 * ## Sections and elements
 *
 * ## Event listeners
 */
export class ConcretePresentation
  extends ConcreteAnchoredObjectBase
  implements Presentation, PresentationViewOwner
{
  private basisWidth_: number;
  private basisHeight_: number;
  private readonly viewportHeightAnchor_: Anchors.Anchor;

  private readonly sections_: ConcreteSection[] = [];

  private view_: PresentationView = new NullPresentationView(this);
  private scaleHelper_: ScaleHelper;

  private layouts_: Layout[] = [];
  private defaultLayout_: Layout;
  private layout_: Layout;
  private layoutPicker_: LayoutPicker | null = null;

  constructor(options: PresentationOptions = {}) {
    super("presentation");

    const { immutableConstant } = Anchors;

    this.basisWidth_ = options.basisWidth ?? DEFAULT_SLIDE_WIDTH;
    this.basisHeight_ = options.basisHeight ?? DEFAULT_SLIDE_HEIGHT;
    this.scaleHelper_ = new ScaleHelper(this);

    this.viewportHeightAnchor_ = new Anchors.Anchor(
      this,
      new Anchors.DerivedAnchorExpression(
        [],
        () => this.computeViewportHeight(),
        "viewport.height",
      ),
    );

    this.defaultLayout_ = this.layout_ = new ConcreteLayout(this, {
      basisWidth: this.basisWidth_,
      basisHeight: this.basisHeight_,
    });
    this.layouts_.push(this.defaultLayout_);
    this.supplyDefaultLayout(this.defaultLayout_);

    this.setHorizontalAnchors({
      left: immutableConstant(0),
      width: immutableConstant(this.basisWidth_),
    });

    this.setVerticalAnchors({
      top: immutableConstant(0),
      height: immutableConstant(this.basisHeight_),
    });
  }

  // **********************************************************************************************
  // Presentation implementation
  // **********************************************************************************************

  addSection(): Section {
    const { offsetFrom } = Anchors;

    const section = new ConcreteSection(this);
    const previousSection = this.sections_.at(LAST_INDEX);

    // Setup some default anchors for the new section. The section is expected to be resized by the
    // view, but this at least gives it a starting point.

    section.setHorizontalAnchors({
      left: offsetFrom(this.leftAnchor, 0),
      right: offsetFrom(this.rightAnchor, 0),
    });

    section.setVerticalAnchors({
      top: previousSection
        ? offsetFrom(previousSection.bottomAnchor, 0)
        : offsetFrom(this.topAnchor, 0),
      height: offsetFrom(this.viewportHeightAnchor, 0),
    });

    this.sections_.push(section);

    // Sync with the presentation - we must account for:
    // - Any existing layouts (layout might exist before we do)
    // - The current layout might not be the default

    this.layouts_.forEach((layout) =>
      this.layoutAdded(layout, this.activeLayout),
    );
    section.setActiveLayout(this.activeLayout);

    return section;
  }

  getSections(): readonly Section[] {
    return this.sections_;
  }

  get view(): PresentationView {
    return this.view_;
  }

  addLayout(opts: { basisWidth: number; basisHeight: number }): Layout {
    const l = new ConcreteLayout(this, opts);
    this.layouts_.push(l);
    this.layoutAdded(l, this.activeLayout);
    return l;
  }

  get activeLayout(): Layout {
    return this.layout_;
  }

  get defaultLayout(): Layout {
    return this.defaultLayout_;
  }

  setActiveLayout(layout: Layout): void {
    if (layout.presentation !== this) {
      throw new Error("Layout does not belong to this presentation");
    }

    if (this.layout_ === layout) {
      return;
    }

    this.layout_ = layout;
    this.layoutPicker_ = null;
    this.activeLayoutChanged();
  }

  get hasLayoutPicker(): boolean {
    return this.layoutPicker_ !== null;
  }

  get layoutPicker(): LayoutPicker {
    if (!this.layoutPicker_) {
      throw new Error("LayoutPicker is not set");
    }
    return this.layoutPicker_;
  }

  setLayoutPicker(layoutPicker: LayoutPicker): void {
    this.layoutPicker_ = layoutPicker;
  }

  /**
   * Replaces the current view hierarchy with a new one created by the provided view factory.
   */
  replaceView(
    factory: (owner: PresentationViewOwner) => PresentationView,
  ): void {
    // Implementation notes:
    // - We destroy/recreate parents before children
    // - Child views are entitled to rely on this
    //
    // IMPORTANT: the Presentation hierarchy must remain stable during this call.
    //

    this.view_.destroy();
    this.view_ = factory(this);

    this.sections_.forEach((section) => section.replaceView(this.view_));

    this.layout(this.view_.width, this.view_.height);
  }

  get basisWidth(): number {
    return this.basisWidth_;
    //return this.layout_.basisWidth;
  }

  get basisHeight(): number {
    return this.basisHeight_;
    //return this.layout_.basisHeight;
  }

  get viewportHeight(): number {
    return this.viewportHeightAnchor_.value;
  }

  get viewportHeightAnchor(): Anchors.Anchor {
    return this.viewportHeightAnchor_;
  }

  private computeViewportHeight(): number {
    const scale = this.scaleHelper_.scale;
    if (scale <= 0) {
      return this.basisHeight_;
    }

    return this.scaleHelper_.height / scale;
  }

  get totalHeight(): number {
    const lastSection = this.sections_.at(LAST_INDEX);
    return lastSection ? lastSection.bottom : 0;
  }

  get physicalGeometry(): { width: number; height: number; scale: number } {
    return {
      width: this.scaleHelper_.width,
      height: this.scaleHelper_.height,
      scale: this.scaleHelper_.scale,
    };
  }

  // **********************************************************************************************
  // PresentationViewOwner implementation
  // **********************************************************************************************

  layout(width: number, height: number): void {
    this.scaleHelper_.setPhysicalDimensions({ width, height });

    if (this.hasLayoutPicker) {
      const pickedLayout = this.layoutPicker_!.pickLayout(this);

      if (pickedLayout != this.layout_) {
        this.layout_ = pickedLayout;
        this.activeLayoutChanged();
      }
    }

    const t = this.layoutTransformation;
    this.view_.layout(t);
    this.sections_.forEach((section) => section.layout(t));
  }

  get layoutTransformation(): { scale: number; tx: number } {
    return {
      scale: this.scaleHelper_.scale,
      tx: this.scaleHelper_.tx,
    };
  }

  // **********************************************************************************************
  // ConcretePresentation implementation
  // **********************************************************************************************

  get layouts(): readonly Layout[] {
    return this.layouts_;
  }

  layoutAdded(layout: Layout, copyFrom: Layout): void {
    super.layoutAdded(layout, copyFrom);
    this.sections_.forEach((section) => section.layoutAdded(layout, copyFrom));
  }

  private activeLayoutChanged(): void {
    this.sections_.forEach((section) => section.setActiveLayout(this.layout_));
  }
}
