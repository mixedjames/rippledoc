import {
  Presentation,
  ConcretePresentation,
} from "../presentation/Presentation";
import { Element, ConcreteElement } from "../element/Element";

import { NullSectionView, SectionView, SectionViewOwner } from "./SectionView";
import { ViewFactory } from "../presentation/ViewFactory";

import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import * as Anchors from "../../anchors/index";
import { PresentationViewOwner } from "../presentation/PresentationView";

const DEFAULT_HORIZONTAL_MARGIN_FRACTION = 0.05;
const DEFAULT_WIDTH_FRACTION = 0.3;
const DEFAULT_HEIGHT_FRACTION = 0.25;

/**
 * A Section represents a horizontal slice of a presentation slide.
 *
 * It can contain multiple elements, which are positioned relative to the section's anchors.
 * Sections are stacked vertically within the presentation.
 */
export interface Section extends ConcreteAnchoredObjectBase {
  /**
   * Adds a new element to the section.
   */
  addElement(): Element;

  /**
   * Returns all elements within the section.
   */
  getElements(): readonly Element[];

  /**
   * The presentation that this section belongs to.
   */
  get presentation(): Presentation;
}

/**
 *
 */
export class ConcreteSection
  extends ConcreteAnchoredObjectBase
  implements Section, SectionViewOwner
{
  private readonly presentation_: ConcretePresentation;

  private readonly elements_: ConcreteElement[] = [];

  private view_: SectionView = new NullSectionView();

  constructor(presentation: ConcretePresentation) {
    super("section");
    this.presentation_ = presentation;
  }

  // **********************************************************************************************
  // Section implementation
  // **********************************************************************************************

  get presentation(): Presentation {
    return this.presentation_;
  }

  addElement(): Element {
    const { fractionOf, offsetFrom } = Anchors;

    const element = new ConcreteElement(this);
    const margin =
      this.presentation_.slideWidth * DEFAULT_HORIZONTAL_MARGIN_FRACTION;

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

  replaceView(viewFactory: ViewFactory): void {
    this.view_.destroy();
    this.view_ = viewFactory.createSectionView(this);

    this.elements_.forEach((element) => element.replaceView(viewFactory));
  }

  // **********************************************************************************************
  // SectionViewOwner implementation
  // **********************************************************************************************

  get presentationViewOwner(): PresentationViewOwner {
    return this.presentation_;
  }
}
