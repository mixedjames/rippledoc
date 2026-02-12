import type {
  SectionView,
  Section,
  Presentation,
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
 */
export class HTMLSectionView implements SectionView {
  private readonly section_: Section;
  private readonly slug_: string;
  private backgroundElement_: HTMLDivElement | null = null;
  private contentElement_: HTMLElement | null = null;

  constructor(options: { section: Section }) {
    this.section_ = options.section;
    this.slug_ = this.computeSlug();
  }

  /** Background DOM node for this section (created after realise()). */
  get backgroundElement(): HTMLDivElement | null {
    return this.backgroundElement_;
  }

  /** Content <section> DOM node for this section (created after realise()). */
  get contentElement(): HTMLElement | null {
    return this.contentElement_;
  }

  realise(): void {
    if (this.backgroundElement_ && this.contentElement_) {
      return;
    }

    const bg = document.createElement("div");
    bg.className = `${this.slug_}-section-background`;
    bg.dataset.sectionName = this.section_.name;

    // Add a small label so section identities are visible in demos.
    const label = document.createElement("span");
    label.className = "section-label";
    const name = this.section_.name?.trim();
    label.textContent = name && name.length > 0 ? name : this.slug_;
    bg.appendChild(label);

    const sectionEl = document.createElement("section");
    sectionEl.className = `${this.slug_}-section-content`;
    sectionEl.dataset.sectionName = this.section_.name;

    this.backgroundElement_ = bg;
    this.contentElement_ = sectionEl;

    // Attach this section's DOM nodes into the presentation's root containers.
    // Presentation.realiseView() guarantees that the PresentationView has already
    // been realised by the time Section.realiseView() is invoked.
    const presentation = this.section_.parent as Presentation;
    const presentationView = presentation.view;
    if (!(presentationView instanceof HTMLPresentationView)) {
      throw new Error(
        "HTMLSectionView.realise() expected parent Presentation.view to be an HTMLPresentationView",
      );
    }

    const backgrounds = presentationView.backgroundsContainer;
    const elements = presentationView.elementsContainer;
    if (!backgrounds || !elements) {
      throw new Error(
        "HTMLSectionView.realise() called before presentation view was fully realised",
      );
    }

    backgrounds.appendChild(bg);
    elements.appendChild(sectionEl);
  }

  layout(): void {
    if (!this.backgroundElement_ || !this.contentElement_) {
      throw new Error("HTMLSectionView.layout() called before realise()");
    }

    const background = this.backgroundElement_!;
    const content = this.contentElement_!;

    const presentation = this.section_.parent as Presentation;
    const geometry = presentation.geometry;
    const scale = geometry.scale;
    const tx = geometry.tx;
    const basisWidth = geometry.basis.width;

    // Section geometry in basis coordinates
    const top = this.section_.sectionTop;
    const height = this.section_.sectionHeight;

    // Convert to viewport pixels using the presentation geometry
    const topPx = top * scale;
    const heightPx = height * scale;
    const leftPx = tx;
    const widthPx = basisWidth * scale;

    const bgStyle = background.style;
    bgStyle.position = "absolute";
    bgStyle.left = `${leftPx}px`;
    bgStyle.top = `${topPx}px`;
    bgStyle.width = `${widthPx}px`;
    bgStyle.height = `${heightPx}px`;

    // Apply section fill style as a background.
    const fill = this.section_.style.fill;
    const color = fill.color;
    if (color.a > 0) {
      const alpha = color.a / 255;
      bgStyle.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    }

    const imageSource = fill.imageSource;
    if (imageSource && imageSource.trim() !== "") {
      bgStyle.backgroundImage = `url(${imageSource})`;
      bgStyle.backgroundSize = "cover";
      bgStyle.backgroundRepeat = "no-repeat";
      bgStyle.backgroundPosition = "center center";
    }

    // Content sections are all positioned at the top-left of the
    // root so that child elements can use global absolute coords.
    const contentStyle = content.style;
    contentStyle.position = "absolute";
    contentStyle.left = "0";
    contentStyle.top = "0";
  }

  private computeSlug(): string {
    const explicitName = this.section_.name?.trim();
    if (explicitName && explicitName.length > 0) {
      return HTMLSectionView.slugify(explicitName);
    }

    const presentation = this.section_.parent as Presentation;
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
