import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import * as Anchors from "../../anchors/index";
import { Section, ConcreteSection } from "../section/Section";
import { PresentationView, PresentationViewOwner } from "./PresentationView";
import { NullPresentationView } from "../nullView/NullPresentationView";
import { ScaleHelper } from "./ScaleHelper";

const DEFAULT_SLIDE_WIDTH = 1000;
const DEFAULT_SLIDE_HEIGHT = 1000;
const LAST_INDEX = -1;

export interface PresentationOptions {
  basisWidth?: number;
  basisHeight?: number;
}

export interface Presentation extends ConcreteAnchoredObjectBase {
  addSection(): Section;
  getSections(): readonly Section[];

  replaceView(
    factory: (owner: PresentationViewOwner) => PresentationView,
  ): void;

  get basisWidth(): number;
  get basisHeight(): number;
  get viewportHeight(): number;
  get viewportHeightAnchor(): Anchors.Anchor;

  get totalHeight(): number;
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
  readonly basisWidth_: number;
  readonly basisHeight_: number;
  private readonly viewportHeightAnchor_: Anchors.Anchor;

  private readonly sections_: ConcreteSection[] = [];

  private view_: PresentationView = new NullPresentationView(this);
  private scaleHelper_: ScaleHelper;

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
    const { offsetFrom, immutableConstant } = Anchors;

    const section = new ConcreteSection(this);
    const previousSection = this.sections_.at(LAST_INDEX);

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

    this.setVerticalAnchors({
      top: immutableConstant(0),
      bottom: offsetFrom(section.bottomAnchor, 0),
    });

    return section;
  }

  getSections(): readonly Section[] {
    return this.sections_;
  }

  get view(): PresentationView {
    return this.view_;
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
  }

  get basisHeight(): number {
    return this.basisHeight_;
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

  // **********************************************************************************************
  // PresentationViewOwner implementation
  // **********************************************************************************************

  layout(width: number, height: number): void {
    this.scaleHelper_.setPhysicalDimensions({ width, height });

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
}
