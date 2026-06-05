import { Presentation } from "../presentation/Presentation";
import { Element } from "../element/Element";

import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import { fractionOf, offsetFrom } from "../../anchors/index";

const DEFAULT_HORIZONTAL_MARGIN_FRACTION = 0.05;
const DEFAULT_WIDTH_FRACTION = 0.3;
const DEFAULT_HEIGHT_FRACTION = 0.25;

/**
 * A Section represents a horizontal slice of a presentation slide.
 *
 * It can contain multiple elements, which are positioned relative to the section's anchors.
 * Sections are stacked vertically within the presentation.
 */
export class Section extends ConcreteAnchoredObjectBase {
  private readonly elements_: Element[] = [];

  constructor(readonly presentation: Presentation) {
    super("section");
  }

  addElement(): Element {
    const element = new Element(this);
    const margin =
      this.presentation.slideWidth * DEFAULT_HORIZONTAL_MARGIN_FRACTION;

    element.setHorizontalAnchors({
      left: offsetFrom(this.leftAnchor, margin),
      width: fractionOf(this.widthAnchor, DEFAULT_WIDTH_FRACTION),
    });

    element.setVerticalAnchors({
      top: offsetFrom(this.topAnchor, margin),
      height: fractionOf(this.heightAnchor, DEFAULT_HEIGHT_FRACTION),
    });

    this.elements_.push(element);
    return element;
  }

  getElements(): readonly Element[] {
    return this.elements_;
  }
}
