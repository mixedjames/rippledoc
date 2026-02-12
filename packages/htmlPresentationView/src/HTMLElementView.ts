import type {
  ElementView,
  Element,
  Presentation,
} from "@rippledoc/presentation";
import { HTMLSectionView } from "./HTMLSectionView";

/**
 * HTML implementation of ElementView.
 *
 * Responsible for creating and laying out a single element in global
 * presentation coordinates. The created DOM node is *not* attached to
 * the document automatically; callers (or higher-level views) can
 * append the exposed root element where appropriate.
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
   * Root DOM element for this view. Only created after realise().
   */
  get rootElement(): HTMLDivElement | null {
    return this.rootElement_;
  }

  realise(): void {
    if (this.rootElement_) {
      return;
    }

    const div = document.createElement("div");
    div.className = `element-${this.slug_}-content`;
    div.dataset.elementName = this.element_.name;

    // Add a label so element names/slugs are visible in demos.
    const label = document.createElement("span");
    label.className = "element-label";
    const name = this.element_.name?.trim();
    label.textContent = name && name.length > 0 ? name : this.slug_;
    div.appendChild(label);

    this.rootElement_ = div;

    // Attach this element's root to its parent section's content container.
    // By the time an Element's view is realised, Presentation.realiseView() and
    // Section.realiseView() guarantee that the parent Section's view has already
    // been realised.
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
  }

  layout(): void {
    if (!this.rootElement_) {
      throw new Error("HTMLElementView.layout() called before realise()");
    }

    const elementNode = this.rootElement_!;
    const section = this.element_.parent;
    const presentation = section.parent as Presentation;
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

  private static slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
