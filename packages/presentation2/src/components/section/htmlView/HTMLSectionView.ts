import { HTMLPresentationViewRoot } from "../../presentation/htmlView/HTMLPresentationViewRoot";
import { Section } from "../Section";
import { HTMLElementView } from "../../element/htmlView/HTMLElementView";
import { TextBoxElement } from "../../element/textBoxElement/TextBoxElement";
import { HTMLTextBoxElementView } from "../../element/textBoxElement/htmlView/HTMLTextBoxElementView";
import { ImageElement } from "../../element/imageElement/ImageElement";
import { HTMLImageElementView } from "../../element/imageElement/htmlView/HTMLImageElementView";

export class HTMLSectionView {
  // Structural relationships ----------------------------------------------------------------------
  //
  private section_: Section;
  private presentationView_: HTMLPresentationViewRoot;
  private elementViews_: HTMLElementView[] = [];

  // DOM elements ----------------------------------------------------------------------------------
  //
  private backgroundElement_: HTMLElement = document.createElement("div");
  private contentElement_: HTMLElement = document.createElement("div");

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  constructor(options: {
    presentationView: HTMLPresentationViewRoot;
    section: Section;
  }) {
    this.presentationView_ = options.presentationView;
    this.section_ = options.section;

    // Order of construction:
    // 1. Create our DOM elements (done in createDOM()) so that children can attach to them.
    // 2. Create our element views, which will create their DOM elements and attach them to the
    //    appropriate parent.

    this.createDOM();

    this.section_.elements.forEach((element) => {
      if (element instanceof TextBoxElement) {
        this.elementViews_.push(
          new HTMLTextBoxElementView({ sectionView: this, element }),
        );
      } else if (element instanceof ImageElement) {
        this.elementViews_.push(
          new HTMLImageElementView({ sectionView: this, element }),
        );
      } else {
        this.elementViews_.push(
          new HTMLElementView({ sectionView: this, element }),
        );
      }
    });
  }

  disconnect(): void {
    this.elementViews_.forEach((ev) => ev.disconnect());
    this.elementViews_.length = 0;
  }

  // ----------------------------------------------------------------------------------------------
  // Structural Relations
  // ----------------------------------------------------------------------------------------------

  get section(): Section {
    return this.section_;
  }

  get presentationView(): HTMLPresentationViewRoot {
    return this.presentationView_;
  }

  get elementViews(): readonly HTMLElementView[] {
    return this.elementViews_;
  }

  get htmlBackgroundElement(): HTMLElement {
    return this.backgroundElement_;
  }

  get htmlContentElement(): HTMLElement {
    return this.contentElement_;
  }

  // ----------------------------------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------------------------------

  private createDOM(): void {
    // (1) Background element
    //
    this.backgroundElement_.classList.add("rdoc-section-background");
    this.presentationView.htmlBackgrounds.appendChild(this.backgroundElement_);

    // (2) Content element
    //
    this.contentElement_.classList.add("rdoc-section-content");
    this.presentationView.htmlElements.appendChild(this.contentElement_);
  }

  layout(): void {
    const scale = this.presentationView.physicalDimensions.scale;
    const tx = this.presentationView.physicalDimensions.tx;
    const basisDimensions = this.section.presentation.basisDimensions;

    // (1) Set up our background element:
    //     - Absolutely positioned to correct size & position as per Section dimensions
    //     - Translated to centre
    this.backgroundElement_.style.left = `${tx}px`;
    this.backgroundElement_.style.top = `${this.section.sectionTop * scale}px`;
    this.backgroundElement_.style.width = `${basisDimensions.width * scale}px`;
    this.backgroundElement_.style.height = `${this.section.sectionHeight * scale}px`;

    // (2) Set up our content element:
    //     - Absolutely positioned to the top of the content area: children are all layed out
    //       in global coordinate space so we don't want any offsets on this element.
    //     - Translated to centre
    //
    this.contentElement_.style.left = `${tx}px`;
    this.contentElement_.style.top = "0px";

    // (3) Layout our element views
    //
    this.elementViews.forEach((elementView) => {
      elementView.layout();
    });
  }
}
