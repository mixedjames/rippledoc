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

  private readonly root_: HTMLElement;
  private container_: HTMLElement | null = null;
  private backgroundsContainer_: HTMLElement | null = null;
  private elementsContainer_: HTMLElement | null = null;

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
    const scrollingElement = options.scrollingElement ?? this.root_;
    this.scrollTriggerManager_ = new HTMLScrollTriggerManager({
      scrollingElement,
      presentation: this.presentation_,
    });
  }

  realise(): void {
    if (this.container_) {
      return;
    }

    const container = document.createElement("div");
    container.className = "presentation-root";
    container.style.position = "relative";

    const backgrounds = document.createElement("div");
    backgrounds.className = "backgrounds";

    const elements = document.createElement("div");
    elements.className = "elements";

    container.appendChild(backgrounds);
    container.appendChild(elements);
    this.root_.appendChild(container);

    this.container_ = container;
    this.backgroundsContainer_ = backgrounds;
    this.elementsContainer_ = elements;
  }

  layout(): void {
    if (!this.container_) {
      throw new Error("HTMLPresentationView.layout() called before realise()");
    }

    // Supports content-dependent layout:
    // Elements with content-dependent geometry have their non-dependent height/width applied
    // and their dependent axis cleared before layout to allow subsequent measurement of the
    // dependent dimension.
    for (const element of this.contentDependentElements_) {
      const elementView = element.view as HTMLElementView;
      elementView.applyContentDependentLayout();
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

    if (!this.container_) {
      this.realise();
    }

    if (!this.container_) {
      throw new Error(
        "HTMLPresentationView.setTriggerMarkerVisibility() called before container was created",
      );
    }

    if (!this.triggerMarkers_) {
      this.triggerMarkers_ = new HTMLTriggerMarkers({
        presentation: this.presentation_,
        container: this.container_,
      });
    }

    this.triggerMarkers_.setVisible(true);
  }

  /** Root container element for this presentation, created during realise(). */
  get container(): HTMLElement | null {
    return this.container_;
  }

  /** Container that holds stacked section background elements. */
  get backgroundsContainer(): HTMLElement | null {
    return this.backgroundsContainer_;
  }

  /** Container that holds section content elements (and their child elements). */
  get elementsContainer(): HTMLElement | null {
    return this.elementsContainer_;
  }

  /**
   * Central manager for all scroll triggers associated with this presentation.
   */
  get scrollTriggerManager(): HTMLScrollTriggerManager {
    return this.scrollTriggerManager_;
  }
}
