import { HTMLSectionView } from "../../section/htmlView/HTMLSectionView";
import { PresentationConnection } from "../PresentationView";
import { PhysicalDimensions, Presentation } from "../Presentation";
import { HTMLPresentationDOM } from "./HTMLPresentationDOM";
import { ScaleHelper } from "./ScaleHelper";

export class HTMLPresentationViewInner {
  // Structural relationships ----------------------------------------------------------------------
  //

  private presentation_: Presentation;
  private connection_: PresentationConnection;

  // Owned properties ------------------------------------------------------------------------------
  //
  private sections_: HTMLSectionView[];

  private dom_: HTMLPresentationDOM;

  private scaleHelper_: ScaleHelper;

  // ----------------------------------------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------------------------------------

  constructor(options: {
    presentation: Presentation;
    connection: PresentationConnection;
    container: HTMLElement | string;
  }) {
    this.presentation_ = options.presentation;
    this.connection_ = options.connection;
    this.scaleHelper_ = new ScaleHelper(options.presentation);

    // Order of DOM construction:
    // 1. Create our DOM elements (done in HTMLPresentationDOM()) so that children can attach to them.
    // 2. Create our section views, which will create their element views, which will create their
    //    DOM elements and attach them to the appropriate parent.
    // 3. Attach our root DOM element to the container provided by the client.
    //    (We wait until the end to attach to the container because we want to avoid unnecessary
    //    reflows as we build our DOM)
    //
    this.dom_ = new HTMLPresentationDOM(this, options.presentation);

    this.sections_ = this.presentation_.sections.map((section) => {
      return new HTMLSectionView({ presentationView: this, section: section });
    });

    this.dom_.appendToContainer(options.container);

    //this.layout();

    new ResizeObserver(() => {
      this.layout();
    }).observe(this.dom_.htmlViewport);
  }

  // ----------------------------------------------------------------------------------------------
  // Structural relationships
  // ----------------------------------------------------------------------------------------------

  get presentation(): Presentation {
    return this.presentation_;
  }

  get connection(): PresentationConnection {
    return this.connection_;
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

  // ----------------------------------------------------------------------------------------------
  // ...
  // ----------------------------------------------------------------------------------------------

  layout(): void {
    this.scaleHelper_.setPhysicalDimensions({
      width: this.dom_.htmlViewport.clientWidth,
      height: this.dom_.htmlViewport.clientHeight,
    });

    this.dom_.layout();

    this.sections_.forEach((section) => {
      section.layout();
    });
  }
}

/**
 * This is the class that clients will interact with. It manages the connection to the presentation
 * and provides access to the HTML view of the presentation.
 */
export class HTMLPresentationView {
  private pImpl_: HTMLPresentationViewInner | null = null;

  constructor(options: {
    presentation: Presentation;
    container: HTMLElement | string;
  }) {
    // We use the self=this pattern to get around a TypeScript issue with getters created as part
    // of an object literal. See get physicalDimensions below.
    //
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    options.presentation.attachView({
      connect: (connection: PresentationConnection) => {
        if (this.pImpl_) {
          throw new Error("Already connected");
        }

        this.pImpl_ = new HTMLPresentationViewInner({
          presentation: options.presentation,
          connection: connection,
          container: options.container,
        });
      }, // connect

      disconnect: () => {
        if (!this.pImpl_) {
          throw new Error("Not connected");
        }

        this.pImpl_ = null;
      }, // disconnect

      get physicalDimensions(): PhysicalDimensions {
        if (!self.pImpl_) {
          throw new Error("Not connected");
        }

        return self.pImpl_.physicalDimensions;
      },
    });
  }
}
