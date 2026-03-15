import type {
  PresentationView,
  Presentation,
  Element,
} from "@rippledoc/presentation";
import { HTMLTriggerMarkers } from "./HTMLTriggerMarkers";
import { HTMLScrollTriggerManager } from "./scrollTrigger/HTMLScrollTriggerManager";
import { HTMLElementView } from "./HTMLElementView";

/**
 * Skeleton HTML implementation of PresentationView.
 *
 * For now this simply creates a container element under the provided
 * root and exposes no-op layout behaviour. Real rendering and layout
 * can be added incrementally.
 */
export class HTMLPresentationView implements PresentationView {
  private readonly presentation_: Presentation;

  /**
   * Host element supplied by the caller.
   * Its size and positioning define the client-visible presentation area.
   */
  private readonly root_: HTMLElement;

  /**
   * Internally created viewport element that holds the scrolling
   * presentation content (backgrounds and elements).
   * This sits inside the host element and is opaque to callers
   * other than its documented class names.
   */
  private container_: HTMLElement | null = null;
  private backgroundsContainer_: HTMLElement | null = null;
  private elementsContainer_: HTMLElement | null = null;
  private pinnedElementsContainer_: HTMLElement | null = null;
  private overlayContainer_: HTMLElement | null = null;
  /**
   * Internal scrollable content wrapper inside the viewport. This is not
   * part of the public structure contract; it exists purely so we can
   * express the presentation's total height in DOM terms.
   */
  private contentContainer_: HTMLElement | null = null;

  private triggerMarkers_: HTMLTriggerMarkers | null = null;
  private readonly scrollTriggerManager_: HTMLScrollTriggerManager;

  private readonly contentDependentElements_: Element[] = [];

  constructor(options: {
    presentation: Presentation;
    root: HTMLElement;
    scrollingElement?: HTMLElement;
  }) {
    this.presentation_ = options.presentation;
    this.root_ = options.root;
    this.scrollTriggerManager_ = new HTMLScrollTriggerManager({
      presentation: this.presentation_,
    });
  }

  realise(): void {
    if (this.container_) {
      return;
    }

    if (!this.root_.style.position || this.root_.style.position === "static") {
      this.root_.style.position = "relative";
    }

    const viewport = document.createElement("div");
    viewport.className = "presentation-root rdoc-presentation-viewport";

    // Internal scrollable content wrapper. Backgrounds and elements live
    // inside this node so its explicit height controls the scroll range.
    const content = document.createElement("div");

    const backgrounds = document.createElement("div");
    backgrounds.className = "backgrounds";

    const elements = document.createElement("div");
    elements.className = "elements";

    content.appendChild(backgrounds);
    content.appendChild(elements);
    viewport.appendChild(content);

    const overlay = document.createElement("div");
    overlay.className = "rdoc-presentation-overlay";
    const overlayStyle = overlay.style;
    overlayStyle.position = "absolute";
    overlayStyle.left = "0";
    overlayStyle.top = "0";
    overlayStyle.right = "0";
    overlayStyle.bottom = "0";

    const pinnedElements = document.createElement("div");
    pinnedElements.className =
      "pinned-elements rdoc-presentation-overlay-pinned";

    overlay.appendChild(pinnedElements);

    this.root_.appendChild(viewport);
    this.root_.appendChild(overlay);

    this.container_ = viewport;
    this.contentContainer_ = content;
    this.backgroundsContainer_ = backgrounds;
    this.elementsContainer_ = elements;
    this.pinnedElementsContainer_ = pinnedElements;
    this.overlayContainer_ = overlay;

    // Ensure scroll-trigger handling is bound to the internal viewport,
    // not the host or any external scrolling element.
    this.scrollTriggerManager_.setScrollingElement(viewport);
  }

  layout(): void {
    if (!this.container_) {
      throw new Error("HTMLPresentationView.layout() called before realise()");
    }

    this.root_.style.setProperty(
      "--presentation-scale",
      this.presentation_.geometry.scale.toPrecision(4), // eslint-disable-line no-magic-numbers
    );

    // Supports content-dependent layout:
    // Elements with content-dependent geometry have their non-dependent height/width applied
    // and their dependent axis cleared before layout to allow subsequent measurement of the
    // dependent dimension.
    for (const element of this.contentDependentElements_) {
      const elementView = element.view as HTMLElementView;
      elementView.applyContentDependentLayout();
    }

    // Express the presentation's total height (in basis coords) as the
    // scrollable content height inside the viewport.
    if (this.contentContainer_) {
      const totalHeight = this.presentation_.totalHeight;
      const geometry = this.presentation_.geometry;
      const scale = geometry.scale || 1;
      const heightPx = totalHeight * scale;
      this.contentContainer_.style.height = `${heightPx}px`;
    }

    if (this.triggerMarkers_) {
      this.triggerMarkers_.relayout();
    }
  }

  declareContentDependentElements(elements: Element[]): void {
    this.contentDependentElements_.push(...elements);
  }

  setTriggerMarkerVisibility(visible: boolean): void {
    if (!visible) {
      if (this.triggerMarkers_) {
        this.triggerMarkers_.setVisible(false);
      }
      return;
    }

    if (!this.isRealised) {
      this.realise();
    }

    if (!this.triggerMarkers_) {
      this.triggerMarkers_ = new HTMLTriggerMarkers({
        presentation: this.presentation_,
        // contentContainer_ is created whenever the view is realised.
        container: this.contentContainer_!,
      });
    }

    this.triggerMarkers_.setVisible(true);
  }

  get isRealised(): boolean {
    return !!this.container_;
  }

  /** Root container element for this presentation, created during realise(). */
  get container(): HTMLElement {
    if (!this.container_) {
      throw new Error("HTMLPresentationView.container called before realise()");
    }

    return this.container_;
  }

  /** Container that holds stacked section background elements. */
  get backgroundsContainer(): HTMLElement {
    if (!this.backgroundsContainer_) {
      throw new Error(
        "HTMLPresentationView.backgroundsContainer called before realise()",
      );
    }

    return this.backgroundsContainer_;
  }

  /** Container that holds section content elements (and their child elements). */
  get elementsContainer(): HTMLElement {
    if (!this.elementsContainer_) {
      throw new Error(
        "HTMLPresentationView.elementsContainer called before realise()",
      );
    }

    return this.elementsContainer_;
  }

  get pinnedElementsContainer(): HTMLElement {
    if (!this.pinnedElementsContainer_) {
      throw new Error(
        "HTMLPresentationView.pinnedElementsContainer called before realise()",
      );
    }

    return this.pinnedElementsContainer_;
  }

  /**
   * Central manager for all scroll triggers associated with this presentation.
   */
  get scrollTriggerManager(): HTMLScrollTriggerManager {
    return this.scrollTriggerManager_;
  }
}
