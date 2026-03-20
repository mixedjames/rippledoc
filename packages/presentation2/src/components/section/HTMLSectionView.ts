import {
  HTMLPresentationViewInner,
} from "../presentation/HTMLPresentationView";
import { Section } from "./Section";
import { HTMLElementView } from "../element/HTMLElementView";

export class HTMLSectionView {
  // Structural relationships ----------------------------------------------------------------------
  //
  private section_: Section;
  private presentationView_: HTMLPresentationViewInner;
  private elementViews_: HTMLElementView[] = [];

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  constructor(options: {
    presentationView: HTMLPresentationViewInner;
    section: Section;
  }) {
    this.presentationView_ = options.presentationView;
    this.section_ = options.section;

    this.section_.elements.forEach((element) => {
      this.elementViews_.push(
        new HTMLElementView({ sectionView: this, element }),
      );
    });
  }

  // ----------------------------------------------------------------------------------------------
  // Structural Relations
  // ----------------------------------------------------------------------------------------------

  get section(): Section {
    return this.section_;
  }

  get presentationView(): HTMLPresentationViewInner {
    return this.presentationView_;
  }

  get elementViews(): readonly HTMLElementView[] {
    return this.elementViews_;
  }

  // ----------------------------------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------------------------------

  createDOM(): void {
    this.elementViews.forEach((elementView) => {
      elementView.createDOM();
    });
  }

  layout(): void {
    this.elementViews.forEach((elementView) => {
      elementView.layout();
    });
  }
}
