import type {
  SectionView,
  Section,
  ScrollTriggerInternal,
} from "@rippledoc/presentation";

import { HTMLPresentationView } from "./HTMLPresentationView";

/**
 * HTML implementation of SectionView.
 *
 * Each section is represented twice in the DOM:
 * - A background <div> that participates in the stacked backgrounds layer.
 * - A content <section> that acts as the semantic parent for element views.
 *
 * Both nodes are created detached; higher-level code is responsible for
 * inserting them into the appropriate containers.
 *
 * Exposed properties:
 * - isRealised
 * - backgroundElement
 * - contentElement
 */
export class HTMLSectionView implements SectionView {
  private readonly section_: Section;
  private readonly parentView_: HTMLPresentationView;

  private readonly slug_: string;

  private backgroundElement_: HTMLElement | null = null;
  private contentElement_: HTMLElement | null = null;

  constructor(options: { section: Section; parentView: HTMLPresentationView }) {
    this.section_ = options.section;
    this.parentView_ = options.parentView;
    this.slug_ = this.computeSlug();
  }

  /**
   * Indicates whether this view has created its DOM nodes.
   */
  get isRealised(): boolean {
    return this.backgroundElement_ !== null && this.contentElement_ !== null;
  }

  /** Background DOM node for this section. Only valid after realise(). */
  get backgroundElement(): HTMLElement {
    if (!this.backgroundElement_) {
      throw new Error(
        "HTMLSectionView.backgroundElement accessed before realise()",
      );
    }
    return this.backgroundElement_;
  }

  /** Content <section> DOM node for this section. Only valid after realise(). */
  get contentElement(): HTMLElement {
    if (!this.contentElement_) {
      throw new Error(
        "HTMLSectionView.contentElement accessed before realise()",
      );
    }
    return this.contentElement_;
  }

  realise(): void {
    if (this.backgroundElement_ && this.contentElement_) {
      return;
    }

    // (1) Create DOM noted for background
    const bg = document.createElement("div");
    bg.classList.add(`${this.slug_}-section-background`);
    bg.classList.add("rdoc-section-background");

    // (2) Create DOM node for content
    const sectionEl = document.createElement("section");
    sectionEl.classList.add(`${this.slug_}-section-content`);
    sectionEl.classList.add("rdoc-section-content");

    this.backgroundElement_ = bg;
    this.contentElement_ = sectionEl;

    // (3) Attach this section's DOM nodes into the presentation's root containers.
    //
    // Note:
    //   Presentation.display.realise() guarantees that the PresentationView has already
    //   been realised by the time this section view is realised.
    const presentation = this.section_.parent;
    const presentationView = presentation.view as HTMLPresentationView;

    const backgrounds = presentationView.backgroundsContainer;
    const elements = presentationView.elementsContainer;

    backgrounds.appendChild(bg);
    elements.appendChild(sectionEl);
  }

  layout(): void {
    if (!this.isRealised) {
      throw new Error("HTMLSectionView.layout() called before realise()");
    }

    this.applyPositioning();
    this.applyStyle();
  }

  private applyPositioning(): void {
    // (1) Position the background element to cover the section's area in the presentation.
    //
    const presentation = this.section_.parent;
    const geometry = presentation.geometry;

    const scale = geometry.scale;
    const tx = geometry.tx;
    const basisWidth = geometry.basis.width;

    const top = this.section_.sectionTop;
    const height = this.section_.sectionHeight;

    const topPx = top * scale;
    const heightPx = height * scale;
    const leftPx = tx;
    const widthPx = basisWidth * scale;

    const bgStyle = this.backgroundElement.style;
    bgStyle.position = "absolute";
    bgStyle.left = `${leftPx}px`;
    bgStyle.top = `${topPx}px`;
    bgStyle.width = `${widthPx}px`;
    bgStyle.height = `${heightPx}px`;

    // (2) Content sections are all positioned at the top-left of the
    // root so that child elements can use global absolute coords.
    const contentStyle = this.contentElement.style;
    contentStyle.position = "absolute";
    contentStyle.left = "0";
    contentStyle.top = "0";
  }

  private applyStyle(): void {
    // Apply section fill style as a background.
    const bgStyle = this.backgroundElement.style;
    const fill = this.section_.style.fill;

    const color = fill.color;
    if (color.a > 0) {
      const MAX_COLOR_VALUE = 255;
      const alpha = color.a / MAX_COLOR_VALUE;
      bgStyle.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    }

    const imageSource = fill.imageSource;
    if (imageSource && imageSource.trim() !== "") {
      bgStyle.backgroundImage = `url(${imageSource})`;
      bgStyle.backgroundSize = "cover";
      bgStyle.backgroundRepeat = "no-repeat";
      bgStyle.backgroundPosition = "center center";
    }
  }

  registerScrollTriggers(triggers: readonly ScrollTriggerInternal[]): void {
    const presentation = this.section_.parent;
    const presentationView = presentation.view;
    if (presentationView instanceof HTMLPresentationView) {
      presentationView.scrollTriggerManager.registerTriggers(triggers);
    }
  }

  private computeSlug(): string {
    const explicitName = this.section_.name?.trim();
    if (explicitName && explicitName.length > 0) {
      return HTMLSectionView.slugify(explicitName);
    }

    const presentation = this.section_.parent;
    const sections = presentation.sections;
    const index = sections.indexOf(this.section_);
    const ordinal = index >= 0 ? index + 1 : 1;
    return `s${ordinal}`;
  }

  private static slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
