import {
  Presentation,
  PhysicalDimensions,
  ContentDependentElement,
} from "../Presentation";
import { HTMLPresentationDOM } from "./HTMLPresentationDOM";
import { HTMLSectionView } from "../../section/htmlView/HTMLSectionView";
import { ScaleHelper } from "./ScaleHelper";
import { HTMLScrollTriggerManager } from "../../scrollTrigger/htmlView/HTMLScrollTriggerManager";
import { HTMLPinManager } from "../../pin/htmlView/HTMLPinManager";
import { HTMLElementView } from "../../element/htmlView/HTMLElementView";
import { Element } from "../../element/Element";

type HTMLContentDependentElement = {
  elementView: HTMLElementView;
  valueHolder: { value: number };
};

export class HTMLPresentationViewRoot {
  // Structural relationships ----------------------------------------------------------------------
  //

  private presentation_: Presentation;

  // Owned properties ------------------------------------------------------------------------------
  //

  private dom_: HTMLPresentationDOM;
  private scaleHelper_: ScaleHelper;
  private resizeObserver_: ResizeObserver;

  private sections_: HTMLSectionView[];
  private scrollTriggerManager_: HTMLScrollTriggerManager;
  private pinManager_: HTMLPinManager;

  private sortedContentDependentElements_: HTMLContentDependentElement[];

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  constructor(options: {
    presentation: Presentation;
    container: HTMLElement | string;
    sortedContentDependentElements: ContentDependentElement[];
    debugMode?: boolean;
  }) {
    this.presentation_ = options.presentation;
    this.scaleHelper_ = new ScaleHelper(options.presentation);

    // Order of DOM construction:
    // 1. Create our DOM elements (done in HTMLPresentationDOM()) so that children can attach to them.
    // 2. Create our section views, which will create their element views, which will create their
    //    DOM elements and attach them to the appropriate parent.
    // 3. Attach our root DOM element to the container provided by the client.
    //    (We wait until the end to attach to the container because we want to avoid unnecessary
    //    reflows as we build our DOM)
    // 4. Observe resize events on our viewport element
    //    Do this last so that resisze events don't trigger before we're fully constructed.
    //

    // (1)
    this.dom_ = new HTMLPresentationDOM(
      this,
      options.presentation,
      options.debugMode,
    );

    // (2)
    this.sections_ = this.presentation_.sections.map((section) => {
      return new HTMLSectionView({ presentationView: this, section: section });
    });

    this.sortedContentDependentElements_ =
      this.buildContentDependentElementList(
        options.sortedContentDependentElements,
      );

    // (3)
    this.dom_.appendToContainer(options.container);

    // (4) *** MUST BE LAST STEP IN CONSTRUCTION ***
    // Our hierarchy + associated DOM is now complete.

    this.scrollTriggerManager_ = new HTMLScrollTriggerManager({
      htmlPresentationRoot: this,
    });
    this.pinManager_ = new HTMLPinManager({ htmlPresentationRoot: this });

    this.resizeObserver_ = new ResizeObserver(() => {
      this.layout();
    });
    this.resizeObserver_.observe(this.dom_.htmlViewport);
  }

  /**
   * We have Element[] and we need HTMLElementView[]. Because Element doesn't have a reference to
   * its view, we need to find the corresponding HTMLElementView for each Element.
   *
   * FIXME: In the future I'd like a way for Element to know about its view without having to do
   * this kind of lookup. *But* I want to be sure that the view isn't mutable by clients so it
   * needs a bit of thought - hence this funky lookup method for now.
   */
  private buildContentDependentElementList(
    sortedContentDependentElements: ContentDependentElement[],
  ): HTMLContentDependentElement[] {
    const elementToValueHolder = new Map<Element, { value: number }>();
    sortedContentDependentElements.forEach((cde) => {
      elementToValueHolder.set(cde.element, cde.valueHolder);
    });

    const result: HTMLContentDependentElement[] = [];

    this.sections.forEach((section) => {
      section.elementViews.forEach((e) => {
        const valueHolder = elementToValueHolder.get(e.element);
        if (valueHolder) {
          result.push({
            elementView: e,
            valueHolder: valueHolder,
          });
        }
      });
    });

    return result;
  }

  /**
   * Disconnects the view from the presentation.
   *
   * In general we disconnect in the reverse order of construction:
   * - Bubble disconnect to sections
   * - Then do our own cleanup (disconnect DOM, disconnect resize observer)
   *
   * Exception to this is that we disconnect the resize observer first, because we don't want to
   * trigger any layout calls after we've started disconnecting our sections and DOM.
   */
  disconnect(): void {
    this.resizeObserver_.disconnect();

    this.sections_.forEach((s) => s.disconnect());
    this.sections_.length = 0;

    this.dom_.disconnect();
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get presentation(): Presentation {
    return this.presentation_;
  }

  get sections(): readonly HTMLSectionView[] {
    return this.sections_;
  }

  // ----------------------------------------------------------------------------------------------
  // Properties
  // ----------------------------------------------------------------------------------------------

  get physicalDimensions(): PhysicalDimensions {
    return {
      width: this.scaleHelper_.width,
      height: this.scaleHelper_.height,
      scale: this.scaleHelper_.scale,
      tx: this.scaleHelper_.tx,
    };
  }

  get htmlRoot(): HTMLElement {
    return this.dom_.htmlRoot;
  }

  get htmlViewport(): HTMLElement {
    return this.dom_.htmlViewport;
  }

  get htmlOverlay(): HTMLElement {
    return this.dom_.htmlOverlay;
  }

  get htmlBackgrounds(): HTMLElement {
    return this.dom_.htmlBackgrounds;
  }

  get htmlElements(): HTMLElement {
    return this.dom_.htmlElements;
  }

  get htmlPins(): HTMLElement {
    return this.dom_.htmlPins;
  }

  // ----------------------------------------------------------------------------------------------
  // ...
  // ----------------------------------------------------------------------------------------------

  layout(): void {
    this.htmlRoot.style.setProperty(
      "--presentation-scale",
      this.presentation.physicalDimensions.scale.toPrecision(4), // eslint-disable-line no-magic-numbers
    );

    this.scaleHelper_.setPhysicalDimensions({
      width: this.dom_.htmlViewport.clientWidth,
      height: this.dom_.htmlViewport.clientHeight,
    });

    this.dom_.layout();

    this.sortedContentDependentElements_.forEach((cde) => {
      cde.elementView.applyContentDependentSize();
    });
    this.sortedContentDependentElements_.forEach((cde) => {
      cde.valueHolder.value = cde.elementView.measureContentDependentSize();
    });

    this.sections_.forEach((section) => {
      section.layout();
    });
  }
}
