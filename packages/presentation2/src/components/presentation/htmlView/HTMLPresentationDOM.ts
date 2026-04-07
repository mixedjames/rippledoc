import { Presentation } from "../Presentation";
import { HTMLPresentationViewRoot } from "./HTMLPresentationViewRoot";

export class HTMLPresentationDOM {
  private htmlPresentationView_: HTMLPresentationViewRoot;

  // DOM elements - hierarchy:
  //   fragment_ (document fragment)
  //     root_ (div)
  //       viewport_ (div)
  //          backgrounds_ (div)
  //          elements_ (div)
  //       overlay_ (div)

  private fragment_: DocumentFragment = document.createDocumentFragment();

  private root_: HTMLElement = document.createElement("div");
  private shadowRoot_: ShadowRoot = this.root_.attachShadow({ mode: "open" });

  private styles_: HTMLStyleElement = document.createElement("style");
  private viewport_: HTMLElement = document.createElement("div");
  private backgrounds_: HTMLElement = document.createElement("div");
  private elements_: HTMLElement = document.createElement("div");
  private overlay_: HTMLElement = document.createElement("div");
  private pins_: HTMLElement = document.createElement("div");

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  constructor(
    htmlPresentationView: HTMLPresentationViewRoot,
    presentation: Presentation,
    debugMode?: boolean,
  ) {
    this.htmlPresentationView_ = htmlPresentationView;

    // Connect DOM elements:
    //
    this.styles_.textContent = presentation.stylesheet;
    this.shadowRoot_.appendChild(this.styles_);

    //this.root_.appendChild(this.viewport_);
    this.shadowRoot_.appendChild(this.viewport_);
    this.viewport_.appendChild(this.backgrounds_);
    this.viewport_.appendChild(this.elements_);

    //this.root_.appendChild(this.overlay_);
    this.shadowRoot_.appendChild(this.overlay_);
    this.overlay_.appendChild(this.pins_);

    this.fragment_.appendChild(this.root_);

    // Setup standard class names:
    // FIXME: these should be defined as constants somewhere
    //
    this.root_.classList.add("rdoc-root");
    if (debugMode) {
      this.root_.classList.add("rdoc-debug-mode");
    }

    this.viewport_.classList.add("rdoc-viewport");
    this.overlay_.classList.add("rdoc-overlay");
    this.backgrounds_.classList.add("rdoc-backgrounds");
    this.elements_.classList.add("rdoc-elements");
    this.pins_.classList.add("rdoc-pins", "rdoc-elements");

    // The client will provide a container element and will append the fragment to it.
    // We must fill the container.
    //
    [
      this.root_,
      this.viewport_,
      this.overlay_,
      this.backgrounds_,
      this.elements_,
      this.pins_,
    ].forEach((element) => {
      element.style.position = "absolute";
      element.style.left = "0";
      element.style.top = "0";
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.overflow = "hidden";
    });

    // Apply specific styles to certain elements:
    // - The viewport should scroll if content overflows.
    // - The overlay should not capture pointer events (so that it doesn't interfere with interaction with the content)
    //
    this.backgrounds_.style.height = `${presentation.height}px`;
    this.elements_.style.height = `${presentation.height}px`;

    this.viewport_.style.overflowX = "hidden";
    this.viewport_.style.overflowY = "auto";

    this.overlay_.style.pointerEvents = "none";
  }

  disconnect(): void {
    this.root_.remove();
  }

  appendToContainer(container: HTMLElement | string): void {
    // Append our DOM to the container element.
    //
    const containerElement = (function () {
      if (typeof container === "string") {
        const element = document.querySelector(container);
        if (!element) {
          throw new Error(`No element found for selector: ${container}`);
        }
        return element;
      } else {
        return container;
      }
    })();

    containerElement.appendChild(this.fragment_);
  }

  // ----------------------------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------------------------

  layout(): void {
    const tx = this.htmlPresentationView_.physicalDimensions.tx;
    const scale = this.htmlPresentationView_.physicalDimensions.scale;

    this.backgrounds_.style.left = `${tx}px`;
    this.elements_.style.left = `${tx}px`;

    const height = this.htmlPresentationView_.presentation.height * scale;
    this.backgrounds_.style.height = `${height}px`;
    this.elements_.style.height = `${height}px`;
  }

  // ----------------------------------------------------------------------------------------------
  // Properties
  // ----------------------------------------------------------------------------------------------

  get htmlRoot(): HTMLElement {
    return this.root_;
  }

  get htmlViewport(): HTMLElement {
    return this.viewport_;
  }

  get htmlOverlay(): HTMLElement {
    return this.overlay_;
  }

  get htmlBackgrounds(): HTMLElement {
    return this.backgrounds_;
  }

  get htmlElements(): HTMLElement {
    return this.elements_;
  }

  get htmlPins(): HTMLElement {
    return this.pins_;
  }
}
