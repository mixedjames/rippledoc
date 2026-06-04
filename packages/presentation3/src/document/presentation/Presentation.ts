import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import { immutableConstant, offsetFrom } from "../../anchors/index";
import { Section } from "../section/Section";

const DEFAULT_SLIDE_WIDTH = 1000;
const DEFAULT_SLIDE_HEIGHT = 1000;
const LAST_INDEX = -1;

export interface PresentationOptions {
  slideWidth?: number;
  slideHeight?: number;
}

/**
 *
 */
export class Presentation extends ConcreteAnchoredObjectBase {
  readonly slideWidth: number;
  readonly slideHeight: number;

  private readonly sections_: Section[] = [];

  constructor(options: PresentationOptions = {}) {
    super("presentation");

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
    const section = new Section(this);
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
}
