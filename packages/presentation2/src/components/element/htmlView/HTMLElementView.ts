import { HTMLAnimationManager } from "../../animation/htmlView/HTMLAnimationManager";
import { HTMLPresentationViewRoot } from "../../presentation/htmlView/HTMLPresentationViewRoot";
import { HTMLSectionView } from "../../section/htmlView/HTMLSectionView";
import { ContentDependentDimension, Element } from "../Element";

/**
 * Represents the browsers basic Element type.
 *
 * Exists because I made an error in naming elements on my custom DOM and we now have two different
 * Element types in this codebase - the browser's native Element, and our custom Element class.
 */
type DOMElement = globalThis.Element;

/**
 * The problem:
 * - Pinned needs to be able to clone the target element.
 * - ...but Pins shouldn't need to know the details of this
 * - We also need to support sub-component elements on the clone (i.e. if we're animating a specific
 *   part of an SVG image, then we need to be able to support that on the clone as well).
 * - Sometimes the clone target changes (i.e. when an image loads) and we need a mechanism to
 *   resolve that.
 *
 * The solution: HTMLElementViewLinkedClone
 *
 * This class provides a linked clone of an HTMLElementView's htmlElement. It is linked in the sense
 * that it knows how to clone an element and, when triggered, will update itself. (Although it cant
 * detect this automatically)
 */
export class HTMLElementViewLinkedClone {
  private elementView_: HTMLElementView;
  private htmlElement_!: HTMLElement;

  /**
   * Creates a linked clone helper for the given HTMLElementView; constructed by HTMLElementView.makeLinkedClone
   * and used by pin/animation infrastructure rather than application code directly.
   */
  constructor(elementView: HTMLElementView) {
    this.elementView_ = elementView;
    this.update();
  }

  /** Returns the source HTMLElementView that this linked clone mirrors; read by pin/animation views. */
  get elementView(): HTMLElementView {
    return this.elementView_;
  }

  /** Returns the current cloned HTMLElement that should be inserted into the DOM by callers such as HTMLPinView. */
  get htmlElement(): HTMLElement {
    return this.htmlElement_;
  }

  /**
   * Rebuilds the cloned HTMLElement from the current state of the source HTMLElementView; called initially
   * from the constructor and subsequently by pin/animation code when the source DOM changes.
   */
  update(): void {
    if (this.htmlElement_) {
      this.htmlElement_.remove();
    }

    this.htmlElement_ = this.subclassClone();
  }

  /**
   * See Element.allowsSubComponentElements
   *
   * Much like Element itself, we don't support sub-component elements on the linked clone, but
   * subclasses can. Override this and `getSubComponentElement` in tandem to support sub-component
   * elements on the linked clone.
   */
  get allowsSubComponentElements(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSubComponentElement(name: string): DOMElement {
    throw new Error(
      "HTMLElementViewLinkedClone does not support sub-component elements.",
    );
  }

  /**
   * Subclasses can override this method to provide a custom cloning implementation if needed.
   *
   * The default implementation simply deep-clones the elementView's htmlElement.
   * (`HTMLElement.cloneNode(true)`)
   *
   * *Note:* this method is called from the constructor and from `update()`, so it needs to be able
   * to run before the subclass constructor. Beware!
   */
  protected subclassClone(): HTMLElement {
    return this.elementView_.htmlElement.cloneNode(true) as HTMLElement;
  }
}

/**
 * HTMLElementView owns the DOM representation for a presentation Element inside a Section and
 * coordinates layout, sizing, pinning support, and animation integration for that Element.
 *
 * ## Intended interactions
 * - Constructed by section/element view factories (or subclasses) with a SectionView and Element.
 * - Presentation layout code calls layout(), applyContentDependentSize(), and measureContentDependentSize().
 * - Animation infrastructure (via HTMLAnimationManager) queries DOM through htmlElement / foreground/background
 *   element getters and uses animatableObjectChanges() when subclass DOM structure changes.
 * - Subclasses follow the strict pattern below to customise DOM structure and layout while keeping the
 *   rest of the behaviour consistent.
 *
 * ## Current coupling
 * - Tightly coupled to HTMLSectionView/HTMLPresentationViewRoot for coordinate system and DOM parenting.
 * - Creates an HTMLAnimationManager for itself during createDOM() to manage pins and animations.
 * - Exposes makeLinkedClone(), allowsSubComponentElements, and getSubComponentElement() as extension points
 *   used by pin/animation views; most application code should not call these directly.
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

  private animationManager_!: HTMLAnimationManager;

  /** Constructs a view for the given Element within a SectionView; called by factories and subclass constructors. */
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

  disconnect(): void {
    this.animationManager_.disconnect();
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  /** Returns the underlying presentation Element model; read by layout, animation, and subclasses. */
  get element(): Element {
    return this.element_;
  }

  /** Returns the root HTMLElement for this view; used by layout and animation code as the main DOM node. */
  get htmlElement(): HTMLElement {
    return this.htmlElement_;
  }

  /** Returns the HTMLElement considered to be in the foreground for this view; overridden by subclasses when needed. */
  get foregroundHTMLElement(): HTMLElement {
    return this.htmlElement_;
  }

  /** Returns the HTMLElement considered to be in the background for this view; overridden by subclasses when needed. */
  get backgroundHTMLElement(): HTMLElement {
    return this.htmlElement_;
  }

  /** Returns the parent HTMLSectionView that owns this element view; used by layout and animation code. */
  get sectionView(): HTMLSectionView {
    return this.sectionView_;
  }

  /** Returns the root HTMLPresentationViewRoot for this element; used to access global layout/scale information. */
  get presentationView(): HTMLPresentationViewRoot {
    return this.sectionView.presentationView;
  }

  // ----------------------------------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------------------------------

  /**
   * Creates the base DOM structure for this element view (a positioned div) and wires it into the
   * section's content DOM; called from the base constructor for non-subclasses.
   */
  protected createDOM(): void {
    this.htmlElement_ = document.createElement("div");
    this.htmlElement_.style.position = "absolute";

    this.htmlElement_.classList.add("rdoc-element");
    if (this.element.name.length > 0) {
      this.htmlElement_.classList.add(`rdoc-element-${this.element.name}`);
    }

    this.sectionView.htmlContentElement.appendChild(this.htmlElement_);

    this.subclassCreateDOM();

    this.animationManager_ = new HTMLAnimationManager({ parent: this });
  }

  /** Subclass hook to create additional DOM for this element; called from createDOM(). */
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
   * Gets the content dependent size of the element in basis coordinates; called by the layout
   * pipeline after applyContentDependentSize() to measure the resulting DOM.
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

  /**
   * Applies the model-based position and size to the DOM and then delegates to subclassLayout()
   * and the HTMLAnimationManager; called from the presentation layout pass.
   */
  layout(): void {
    const scale = this.presentationView.physicalDimensions.scale;

    this.htmlElement_.style.left = `${this.element.left * scale}px`;
    this.htmlElement_.style.top = `${this.element.top * scale}px`;
    this.htmlElement_.style.width = `${this.element.width * scale}px`;
    this.htmlElement_.style.height = `${this.element.height * scale}px`;

    this.subclassLayout();

    this.animationManager_.layout();
  }

  /** Subclass hook to perform additional layout work after the base element has been positioned/sized. */
  protected subclassLayout(): void {}

  /**
   * Call this from subclasses when the structure of the Element's DOM changes in a way that might
   * affect animations.
   *
   * This function exists because in 2026 pinning is a pain in the ass. In order to get visually
   * perfect pinning we end up cloning the target object as part of the process. If the Element
   * changes after the pin is created, then that change will get missed.
   *
   * This function gives the HTMLAnimationManager a change to catch up.
   */
  protected animatableObjectChanges(): void {
    this.animationManager_.animatableObjectChanges();
  }

  /**
   * Reports whether sub-component elements are supported by this Element type.
   *
   * The default implementation returns false. Subclasses should override this property if they
   * support sub-component elements.
   *
   * See HTMLElementView.getSubComponentElement. Called primarily by animation/pin infrastructure
   * when resolving animation targets, rather than by general application code.
   */
  get allowsSubComponentElements(): boolean {
    return false;
  }

  /**
   * Some Element types (for example SVG images) support accessing specific named
   * subcomponents within the top level Element object. In the SVG example you can access individual
   * SVG DOM elements for the purposes of animation, without needing to create a separate Element
   * for each one.
   *
   * The default implementation does not support sub-component elements, and will throw an error.
   * Subclasses that do support sub-component elements should override this method to return the
   * appropriate DOMElement for the given sub-component name. This is typically called by
   * HTMLAnimationManager/HTMLPinView when resolving animation targets.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSubComponentElement(name: string): DOMElement {
    throw new Error("HTMLElementView does not support sub-component elements.");
  }

  /**
   * Creates a linked clone helper for this element view; used by HTMLPinView and related
   * animation infrastructure to obtain a clone that can track changes to the original DOM.
   */
  makeLinkedClone(): HTMLElementViewLinkedClone {
    return new HTMLElementViewLinkedClone(this);
  }
}
