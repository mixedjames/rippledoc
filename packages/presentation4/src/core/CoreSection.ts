import type { Section } from "../clientAPI/Section";
import type { PresentationRoot } from "../clientAPI/PresentationRoot";
import type { Element } from "../clientAPI/Element";
import type { MarkdownElement } from "../clientAPI/elements/MarkdownElement";
import type { BitmapImageElement } from "../clientAPI/elements/BitmapImageElement";
import type { SVGImageElement } from "../clientAPI/elements/SVGImageElement";
import type { SectionView } from "../viewAPI/SectionView";
import type { SectionViewOwner } from "../viewAPI/SectionViewOwner";
import type { PresentationViewOwner } from "../viewAPI/PresentationViewOwner";
import type { LayoutTransform } from "../viewAPI/LayoutTransform";
import { AnchoredObjectBase } from "./AnchoredObjectBase";
import { NullSectionView } from "./nullView/NullSectionView";
import { CoreMarkdownElement } from "./elements/CoreMarkdownElement";
import { CoreBitmapImageElement } from "./elements/CoreBitmapImageElement";
import { CoreSVGImageElement } from "./elements/CoreSVGImageElement";
import type { CorePresentationRoot } from "./CorePresentationRoot";
import type { CoreElement } from "./CoreElement";

/**
 * Concrete implementation of Section and SectionViewOwner.
 *
 * Owned by CorePresentationRoot. Owns CoreElement instances. Manages the section
 * view lifecycle: starts with a NullSectionView and receives a real view when
 * CorePresentationRoot.attachView() cascades down the tree.
 */
export class CoreSection
  extends AnchoredObjectBase
  implements Section, SectionViewOwner
{
  private readonly root_: CorePresentationRoot;
  private readonly elements_: CoreElement[] = [];
  private view_: SectionView;

  constructor(root: CorePresentationRoot) {
    super();
    this.root_ = root;
    this.view_ = new NullSectionView();
  }

  /** Called by CorePresentationRoot when a view is being attached. */
  attachView(
    presentationView: import("../viewAPI/PresentationView").PresentationView,
  ): void {
    this.view_.destroy();
    this.view_ = presentationView.createSectionView(this);
    this.elements_.forEach((e) => e.attachView(this.view_));
  }

  /** Called by CorePresentationRoot during layout passes. */
  performLayout(transform: LayoutTransform): void {
    this.view_.layout(transform);
    this.elements_.forEach((e) => e.performLayout(transform));
  }

  // ── Section (clientAPI) ──────────────────────────────────────────────────

  get root(): PresentationRoot {
    return this.root_;
  }

  addMarkdownElement(markdown = ""): MarkdownElement {
    const element = new CoreMarkdownElement(this, markdown);
    element.attachView(this.view_);
    this.elements_.push(element);
    return element;
  }

  addBitmapImageElement(): BitmapImageElement {
    const element = new CoreBitmapImageElement(this);
    element.attachView(this.view_);
    this.elements_.push(element);
    return element;
  }

  addSVGImageElement(): SVGImageElement {
    const element = new CoreSVGImageElement(this);
    element.attachView(this.view_);
    this.elements_.push(element);
    return element;
  }

  getElements(): readonly Element[] {
    return this.elements_;
  }

  // ── SectionViewOwner (viewAPI) ───────────────────────────────────────────

  get presentationViewOwner(): PresentationViewOwner {
    return this.root_.presentationViewOwner;
  }
}
