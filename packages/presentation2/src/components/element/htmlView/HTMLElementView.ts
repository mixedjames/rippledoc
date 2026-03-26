import { HTMLPresentationViewRoot } from "../../presentation/htmlView/HTMLPresentationViewRoot";
import { HTMLSectionView } from "../../section/htmlView/HTMLSectionView";
import { ContentDependentDimension, Element } from "../Element";

/**
 *
 * # Pattern for subclassing
 * This is *not* a limitless extension point. We expect a strict pattern:
 *
 * 1. The constructor *must*:
 *  a. Call super() with the options, and sets subclass: true
 *  b. Call createDOM()
 * 2. You *may* override:
 *  a. subclassCreateDOM() to create the DOM elements for this element, and add them to the DOM
 *  b. subclassLayout() to position the DOM elements for this element
 *  c. get element() to return the correct type of element for this view
 *  d. disconnect() to clean up any resources when this view is removed from the DOM
 *     (indeed you *must* do this if you add any event listeners or other resources that need to be
 *      cleaned up)
 * 3. You *must not* override anything else.
 */
export class HTMLElementView {
  // Structural relationships ----------------------------------------------------------------------
  //
  private element_: Element;
  private sectionView_: HTMLSectionView;

  private htmlElement_!: HTMLElement;

  constructor(options: {
    sectionView: HTMLSectionView;
    element: Element;
    subclass?: boolean;
  }) {
    this.sectionView_ = options.sectionView;
    this.element_ = options.element;

    // If this is a subclass, then we will call createDOM() from the subclass constructor
    if (!options.subclass) {
      this.createDOM();
    }
  }

  disconnect(): void {}

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get element(): Element {
    return this.element_;
  }

  get htmlElement(): HTMLElement {
    return this.htmlElement_;
  }

  get sectionView(): HTMLSectionView {
    return this.sectionView_;
  }

  get presentationView(): HTMLPresentationViewRoot {
    return this.sectionView.presentationView;
  }

  // ----------------------------------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------------------------------

  protected createDOM(): void {
    this.htmlElement_ = document.createElement("div");
    this.htmlElement_.style.position = "absolute";

    this.htmlElement_.classList.add("rdoc-element");
    if (this.element.name.length > 0) {
      this.htmlElement_.classList.add(`rdoc-element-${this.element.name}`);
    }

    this.sectionView.htmlContentElement.appendChild(this.htmlElement_);

    this.subclassCreateDOM();
  }

  protected subclassCreateDOM(): void {}

  /**
   * Content dependent sizing calculations are a two step process to minimise layout thrashing:
   * 1. Application of layout
   * 2. Measurement of content dependent size
   *
   * See PresentationViewRoot.layout
   */
  applyContentDependentSize(): void {
    const scale = this.presentationView.physicalDimensions.scale;

    if (
      this.element.contentDependentDimension == ContentDependentDimension.Width
    ) {
      this.htmlElement_.style.width = "";
      this.htmlElement_.style.height = `${this.element.height * scale}px`;
    } else if (
      this.element.contentDependentDimension == ContentDependentDimension.Height
    ) {
      this.htmlElement_.style.width = `${this.element.width * scale}px`;
      this.htmlElement_.style.height = "";
    } else {
      throw new Error("Element does not have a content dependent dimension");
    }
  }

  /**
   * Gets the content dependent size of the element in basis coordinates.
   */
  measureContentDependentSize(): number {
    const scale = this.presentationView.physicalDimensions.scale;
    const size = this.htmlElement_.getBoundingClientRect();

    if (
      this.element.contentDependentDimension == ContentDependentDimension.Width
    ) {
      return size.width / scale;
    } else if (
      this.element.contentDependentDimension == ContentDependentDimension.Height
    ) {
      return size.height / scale;
    }

    throw new Error("Element does not have a content dependent dimension");
  }

  layout(): void {
    const scale = this.presentationView.physicalDimensions.scale;

    this.htmlElement_.style.left = `${this.element.left * scale}px`;
    this.htmlElement_.style.top = `${this.element.top * scale}px`;
    this.htmlElement_.style.width = `${this.element.width * scale}px`;
    this.htmlElement_.style.height = `${this.element.height * scale}px`;

    this.subclassLayout();
  }

  protected subclassLayout(): void {}
}
