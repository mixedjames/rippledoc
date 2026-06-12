import {
  Presentation,
  ConcretePresentation,
} from "../presentation/Presentation";
import { ConcreteElementBase, type Element } from "../element/ElementBase";
import {
  BitmapImageElement,
  ConcreteBitmapImageElement,
} from "../element/ConcreteBitmapImageElement";
import {
  ConcreteMarkdownElement,
  MarkdownElement,
} from "../element/ConcreteMarkdownElement";
import {
  ConcreteSVGImageElement,
  SVGImageElement,
} from "../element/ConcreteSVGImageElement";

import { SectionView, SectionViewOwner } from "./SectionView";

import { ConcreteAnchoredObjectBase } from "../common/ConcreteAnchoredObjectBase";
import * as Anchors from "../../anchors/index";
import {
  PresentationView,
  PresentationViewOwner,
} from "../presentation/PresentationView";
import { Layout } from "../presentation/Layout";

const DEFAULT_HORIZONTAL_MARGIN_FRACTION = 0.05;
const DEFAULT_WIDTH_FRACTION = 0.3;
const DEFAULT_HEIGHT_FRACTION = 0.25;

/**
 * A Section represents a horizontal slice of a presentation slide.
 *
 * It can contain multiple elements, which are positioned relative to the section's anchors.
 * Sections are stacked vertically within the presentation.
 */
//export interface Section extends ConcreteAnchoredObjectBase {
export interface Section extends Anchors.YAnchoredObject {
  /**
   * Adds a new element to the section.
   */
  addElement(): Element;

  addBitmapImageElement(): BitmapImageElement;
  addSVGImageElement(): SVGImageElement;
  addMarkdownElement(markdown?: string): MarkdownElement;

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

  private readonly elements_: ConcreteElementBase[] = [];

  private view_: SectionView;

  constructor(presentation: ConcretePresentation) {
    super("section");

    this.presentation_ = presentation;
    this.supplyDefaultLayout(this.presentation_.defaultLayout);

    this.view_ = this.presentation_.view.createSectionView(this);
  }

  // **********************************************************************************************
  // Section implementation
  // **********************************************************************************************

  get presentation(): ConcretePresentation {
    return this.presentation_;
  }

  addElement(): Element {
    return this.addMarkdownElement();
  }

  addBitmapImageElement(): BitmapImageElement {
    const element = new ConcreteBitmapImageElement(this);
    this.commonElementInitialization(element);
    return element;
  }

  addSVGImageElement(): SVGImageElement {
    const element = new ConcreteSVGImageElement(this);
    this.commonElementInitialization(element);
    return element;
  }

  addMarkdownElement(markdown = ""): MarkdownElement {
    const element = new ConcreteMarkdownElement(this, markdown);
    this.commonElementInitialization(element);
    return element;
  }

  /**
   * The various specific addXXXElement methods all route through this common method.
   *
   * It does a few fiddling things that have to be right for all elements:
   * - setting up the default anchors for the element
   * - adding the element to the section's list of elements
   * - informing the element about all existing layouts in the presentation, so that it can set up
   *   its layout state for each layout (we must handle case where layouts exist before an element
   *   is added to the section).
   */
  private commonElementInitialization(element: ConcreteElementBase): void {
    this.initializeDefaultElementAnchors(element);
    this.elements_.push(element);
    this.presentation.layouts.forEach((layout) => {
      element.layoutAdded(layout, this.presentation.defaultLayout);
      element.setActiveLayout(this.presentation.activeLayout);
    });
  }

  private initializeDefaultElementAnchors(element: Element): void {
    const { fractionOf, offsetFrom } = Anchors;
    const margin =
      this.presentation_.basisWidth * DEFAULT_HORIZONTAL_MARGIN_FRACTION;

    element.setHorizontalAnchors({
      left: offsetFrom(this.leftAnchor, margin),
      width: fractionOf(this.widthAnchor, DEFAULT_WIDTH_FRACTION),
    });

    element.setVerticalAnchors({
      top: offsetFrom(this.topAnchor, margin),
      height: fractionOf(this.heightAnchor, DEFAULT_HEIGHT_FRACTION),
    });
  }

  getElements(): readonly Element[] {
    return this.elements_;
  }

  replaceView(view: PresentationView): void {
    this.view_.destroy();
    this.view_ = view.createSectionView(this);

    this.elements_.forEach((element) => element.replaceView(this.view_));
  }

  // **********************************************************************************************
  // SectionViewOwner implementation
  // **********************************************************************************************

  get presentationViewOwner(): PresentationViewOwner {
    return this.presentation_;
  }

  get view(): SectionView {
    return this.view_;
  }

  // **********************************************************************************************
  // ConcreteSection implementation
  // **********************************************************************************************

  layout({ scale, tx }: { scale: number; tx: number }): void {
    this.view_.layout({ scale, tx });
    this.elements_.forEach((element) => element.layout({ scale, tx }));
  }

  override setActiveLayout(layout: Layout): void {
    super.setActiveLayout(layout);
    this.elements_.forEach((element) => element.setActiveLayout(layout));
  }

  override layoutAdded(layout: Layout, copyFrom: Layout): void {
    super.layoutAdded(layout, copyFrom);
    this.elements_.forEach((element) => element.layoutAdded(layout, copyFrom));
  }
}
