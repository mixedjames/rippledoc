import { V1PresentationView } from "./V1PresentationView";

export class PresentationDOM {
  private presentationView_: V1PresentationView;

  // DOM elements - hierarchy:
  //   fragment_ (document fragment)
  //     root_ (div)
  //       viewport_ (div)
  //          backgrounds_ (div)
  //          elements_ (div)
  //       overlay_ (div)

  private containerElement_: HTMLElement;

  private fragment_: DocumentFragment = document.createDocumentFragment();

  private root_: HTMLElement = document.createElement("div");
  private shadowRoot_: ShadowRoot = this.root_.attachShadow({ mode: "open" });

  private styles_: HTMLStyleElement = document.createElement("style");
  private viewport_: HTMLElement = document.createElement("div");
  private backgrounds_: HTMLElement = document.createElement("div");
  private elements_: HTMLElement = document.createElement("div");
  private overlay_: HTMLElement = document.createElement("div");
  private pins_: HTMLElement = document.createElement("div");

  constructor(
    presentationView: V1PresentationView,
    container: HTMLElement | string,
  ) {
    this.presentationView_ = presentationView;

    const containerElement =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!containerElement) {
      throw new Error(`Container element not found or was null`);
    }

    if (!(containerElement instanceof HTMLElement)) {
      throw new Error(`Container element is not an HTMLElement`);
    }

    this.containerElement_ = containerElement;
    this.connectDOMElements();

    this.containerElement_.appendChild(this.fragment_);
  }

  private connectDOMElements(): void {
    // Connect DOM elements:
    //
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
    this.root_.classList.add("root");
    //if (debugMode) {
    //  this.root_.classList.add("rdoc-debug-mode");
    //}

    this.viewport_.classList.add("viewport");
    this.overlay_.classList.add("overlay");
    this.backgrounds_.classList.add("backgrounds");
    this.elements_.classList.add("elements");
    this.pins_.classList.add("pins", "elements");

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
      element.style.boxSizing = "border-box";
    });

    // Apply specific styles to certain elements:
    // - The viewport should scroll if content overflows.
    // - The overlay should not capture pointer events (so that it doesn't interfere with
    //   interaction with the content)
    // -

    //this.backgrounds_.style.height = `${presentation.height}px`;
    //this.elements_.style.height = `${presentation.height}px`;

    this.elements_.style.overflow = "visible";

    this.viewport_.style.overflowX = "hidden";
    this.viewport_.style.overflowY = "auto";

    this.overlay_.style.pointerEvents = "none";

    // Debug stuff
    this.viewport_.style.backgroundColor = "black";
    this.backgrounds_.style.backgroundColor = "white";
  }

  get containerElement(): HTMLElement {
    return this.containerElement_;
  }

  get backgroundsContainer(): HTMLElement {
    return this.backgrounds_;
  }

  get elementsContainer(): HTMLElement {
    return this.elements_;
  }

  get viewportContainer(): HTMLElement {
    return this.viewport_;
  }

  layout({ scale, tx }: { scale: number; tx: number }): void {
    [this.backgrounds_, this.elements_].forEach((element) => {
      element.style.left = `${tx}px`;
      element.style.width = `${this.presentationView_.owner.basisWidth * scale}px`;
      element.style.height = `${this.presentationView_.owner.totalHeight * scale}px`;
    });
  }
}
