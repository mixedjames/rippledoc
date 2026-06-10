import {
  Presentation,
  ConcretePresentation,
} from "../presentation/Presentation";
import { type Element } from "../element/ElementBase";
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

  private readonly elements_: Element[] = [];

  private view_: SectionView;

  constructor(presentation: ConcretePresentation) {
    super("section");

    this.presentation_ = presentation;
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
    this.initializeDefaultElementAnchors(element);

    this.elements_.push(element);
    return element;
  }

  addSVGImageElement(): SVGImageElement {
    const element = new ConcreteSVGImageElement(this);
    this.initializeDefaultElementAnchors(element);

    this.elements_.push(element);
    return element;
  }

  addMarkdownElement(markdown = ""): MarkdownElement {
    const element = new ConcreteMarkdownElement(this, markdown);
    this.initializeDefaultElementAnchors(element);

    this.elements_.push(element);
    return element;
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

  //setHorizontalAnchors(descriptor: Anchors.HorizontalAnchors): void {
  //  throw new Error("Section horizontal anchors cannot be changed.");
  //}

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
}
