import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import * as Anchors from "../../anchors/index";
import { Section, ConcreteSection } from "../section/Section";
import { PresentationView, PresentationViewOwner } from "./PresentationView";
import { NullPresentationView } from "../nullView/NullPresentationView";

const DEFAULT_SLIDE_WIDTH = 1000;
const DEFAULT_SLIDE_HEIGHT = 1000;
const LAST_INDEX = -1;

export interface PresentationOptions {
  slideWidth?: number;
  slideHeight?: number;
}

export interface Presentation extends ConcreteAnchoredObjectBase {
  addSection(): Section;
  getSections(): readonly Section[];

  replaceView(
    factory: (owner: PresentationViewOwner) => PresentationView,
  ): void;
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
  implements Presentation
{
  readonly slideWidth: number;
  readonly slideHeight: number;

  private readonly sections_: ConcreteSection[] = [];

  private view_: PresentationView = new NullPresentationView(this);

  constructor(options: PresentationOptions = {}) {
    super("presentation");

    const { immutableConstant } = Anchors;

    this.slideWidth = options.slideWidth ?? DEFAULT_SLIDE_WIDTH;
    this.slideHeight = options.slideHeight ?? DEFAULT_SLIDE_HEIGHT;

    this.setHorizontalAnchors({
      left: immutableConstant(0),
      width: immutableConstant(this.slideWidth),
    });

    this.setVerticalAnchors({
      top: immutableConstant(0),
      height: immutableConstant(this.slideHeight),
    });
  }

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
      height: immutableConstant(this.slideHeight),
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
  }
}
