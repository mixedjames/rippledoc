import {
  ElementView,
  Element,
  ScrollTriggerInternal,
  ContentDependentDimension,
  Pin,
  ScrollTrigger,
} from "@rippledoc/presentation";

import { HTMLSectionView } from "./HTMLSectionView";
import { HTMLPresentationView } from "./HTMLPresentationView";

import { HTMLPin } from "./animation/HTMLPin";

/**
 * HTML implementation of ElementView.
 *
 * Responsible for creating and laying out a single element in global
 * presentation coordinates. The created DOM node is *not* attached to
 * the document automatically; callers (or higher-level views) can
 * append the exposed root element where appropriate.
 *
 * ## Subclassing
 * This class is not designed for free subclassing - it has specific extension points. If you
 * cant find a suitable one, please open an issue or PR to add one rather than overriding things
 * willy-nilly. This is brittle and don't blame me if a subsequent update shoots your custom
 * subclass in the foot.
 *
 * Extension points:
 * - subclassRealise(): called after the root element is created and attached to the parent
 *   section's content container, but before any layout or animation updates are triggered. This is
 *   the main extension point for adding custom content or structure inside the element's root.
 * - applyContentDependentLayout(): called during layout() if the element has a content-dependent
 *   dimension. By default this does nothing;
 *
 */
export class HTMLElementView implements ElementView {
  private readonly element_: Element;
  private readonly slug_: string;
  private rootElement_: HTMLDivElement | null = null;

  constructor(options: { element: Element }) {
    this.element_ = options.element;
    this.slug_ = this.computeSlug();
  }

  /**
   * Indicates whether this view has created its root DOM element.
   */
  get isRealised(): boolean {
    return this.rootElement_ !== null;
  }

  /**
   * Root DOM element for this view. Only valid after realise().
   *
   * Callers should use isRealised to guard access.
   */
  get rootElement(): HTMLDivElement {
    if (!this.rootElement_) {
      throw new Error("HTMLElementView.rootElement accessed before realise()");
    }
    return this.rootElement_;
  }

  realise(): void {
    // Implementation is in three phases to allow for flexible subclassing:
    // (1) Create the root element and attach it to the parent section's content container.
    //     Subclasses can override subclassRealise() to add content or structure
    //     inside the root element without needing to worry about parent section
    //     attachment.
    // (2) Call subclassRealise() to allow subclasses to add content or structure
    //     inside the root element.
    // (3) Notify any HTML-based animations (e.g. pins) that the view has been
    //     realised so they can react to DOM availability.

    // ********************************************************************************************
    // (1) Phase 1: do basic root element creation and attachment to parent section
    //     *before* notifying subclass.
    //

    if (this.rootElement_) {
      return;
    }

    const div = document.createElement("div");
    div.className = `element-${this.slug_}-content`;
    div.dataset.elementName = this.element_.name;

    this.rootElement_ = div;

    // Attach this element's root to its parent section's content container.
    // By the time an Element's view is realised, Presentation.display.realise()
    // guarantees that the parent Section's view has already been realised.
    const section = this.element_.parent;
    const sectionView = section.view;
    if (!(sectionView instanceof HTMLSectionView)) {
      throw new Error(
        "HTMLElementView.realise() expected parent Section.view to be an HTMLSectionView",
      );
    }

    const contentElement = sectionView.contentElement;
    if (!contentElement) {
      throw new Error(
        "HTMLElementView.realise() called before parent section view was realised",
      );
    }

    contentElement.appendChild(div);

    // ********************************************************************************************
    // (2) Phase 2: notify subclass
    //

    this.subclassRealise();

    // ********************************************************************************************
    // (3) Phase 3: notify children (e.g. pins and animations) that the view is fully realised.
    //

    // Notify any HTML-based animations (e.g. pins) that the view
    // has been realised so they can react to DOM availability.
    this.forEachHTMLPin((pin) => {
      pin.refresh();
    });
  }

  protected subclassRealise(): void {
    // Add a label so element names/slugs are visible in demos.
    const label = document.createElement("span");
    label.className = "element-label";
    const name = this.element_.name?.trim();
    label.textContent = name && name.length > 0 ? name : this.slug_;
    this.rootElement.appendChild(label);
  }

  applyContentDependentLayout(): void {
    if (!this.rootElement_) {
      throw new Error(
        "HTMLElementView.applyContentDependentLayout() called before realise()",
      );
    }

    const style = this.rootElement_.style;

    const section = this.element_.parent;
    const presentation = section.parent;
    const geometry = presentation.geometry;

    const scale = geometry.scale;

    switch (this.element_.contentDependentDimension) {
      case ContentDependentDimension.Width: {
        const heightPx = this.element_.height * scale;
        style.height = `${heightPx}px`;
        style.width = "";
        break;
      }

      case ContentDependentDimension.Height: {
        const widthPx = this.element_.width * scale;
        style.height = "";
        style.width = `${widthPx}px`;
        break;
      }

      default:
        // No content-dependent layout needed.
        break;
    }
  }

  layout(): void {
    if (!this.rootElement_) {
      throw new Error("HTMLElementView.layout() called before realise()");
    }

    const elementNode = this.rootElement_;
    const section = this.element_.parent;
    const presentation = section.parent;
    const geometry = presentation.geometry;

    const scale = geometry.scale;
    const tx = geometry.tx;

    const leftPx = this.element_.left * scale + tx;
    const topPx = this.element_.top * scale;
    const widthPx = this.element_.width * scale;
    const heightPx = this.element_.height * scale;

    const style = elementNode.style;
    style.position = "absolute";
    style.left = `${leftPx}px`;
    style.top = `${topPx}px`;
    style.width = `${widthPx}px`;
    style.height = `${heightPx}px`;

    // Apply element fill style as a background, mirroring HTMLSectionView.
    const fill = this.element_.style.fill;
    const color = fill.color;
    if (color.a > 0) {
      const MAX_COLOR_VALUE = 255;
      const alpha = color.a / MAX_COLOR_VALUE;
      style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    }

    const imageSource = fill.imageSource;
    if (imageSource && imageSource.trim() !== "") {
      style.backgroundImage = `url(${imageSource})`;
      style.backgroundSize = "cover";
      style.backgroundRepeat = "no-repeat";
      style.backgroundPosition = "center center";
    }

    // Forward layout changes to any HTMLPin instances so they can
    // keep placeholder and clone positions in sync with this element.
    this.forEachHTMLPin((pin) => {
      pin.refresh();
    });
  }

  registerScrollTriggers(triggers: readonly ScrollTriggerInternal[]): void {
    const section = this.element_.parent;
    const presentation = section.parent;
    const presentationView = presentation.view;
    if (presentationView instanceof HTMLPresentationView) {
      presentationView.scrollTriggerManager.registerTriggers(triggers);
    }
  }

  createPin(options: { trigger: ScrollTrigger }): Pin {
    return new HTMLPin(this.element_, options);
  }

  getContentDependentDimension(d: ContentDependentDimension): number {
    if (!this.rootElement_) {
      throw new Error(
        "HTMLElementView.getContentDependentDimension() called before realise()",
      );
    }

    const section = this.element_.parent;
    const presentation = section.parent;
    const geometry = presentation.geometry;
    const scale = geometry.scale || 1;

    let pixelValue: number;

    switch (d) {
      case ContentDependentDimension.Width:
        pixelValue = this.rootElement_.offsetWidth;
        break;
      case ContentDependentDimension.Height:
        pixelValue = this.rootElement_.offsetHeight;
        break;
      default:
        return 0;
    }

    return pixelValue / scale;
  }

  private computeSlug(): string {
    const explicitName = this.element_.name?.trim();
    if (explicitName && explicitName.length > 0) {
      return HTMLElementView.slugify(explicitName);
    }

    const parent = this.element_.parent;
    const elements = parent.elements;
    const index = elements.indexOf(this.element_);
    const ordinal = index >= 0 ? index + 1 : 1;
    return `${ordinal}`;
  }

  /**
   * Helper to iterate over all HTMLPin instances associated with this
   * element's transform. Uses the model-level animated flag as the
   * source of truth for whether transform state is available.
   */
  private forEachHTMLPin(callback: (pin: HTMLPin) => void): void {
    if (!this.element_.animated) {
      return;
    }

    const transform = this.element_.transform;
    for (const pin of transform.pins) {
      if (pin instanceof HTMLPin) {
        callback(pin);
      }
    }
  }

  private static slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
