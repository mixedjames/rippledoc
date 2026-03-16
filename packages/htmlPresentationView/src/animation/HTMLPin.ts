import { Element, Pin, ScrollTrigger } from "@rippledoc/presentation";
import { HTMLElementView } from "../HTMLElementView";
import { HTMLPresentationView } from "../HTMLPresentationView";

/**
 * HTML implementation of a Pin.
 *
 * Mirrors the behaviour of the earlier Pin.js helper by:
 * - Creating a layout placeholder next to the element's root DOM node.
 * - Rendering a DOM clone inside HTMLPresentationView.pinnedElementsContainer.
 * - Automatically wiring scroll trigger lifecycle events to the pin
 *   behaviour (start/end, forward/reverse).
 */
export class HTMLPin implements Pin {
  private readonly element_: Element;
  private readonly scrollTrigger_: ScrollTrigger;

  private rootElement_: HTMLElement | null = null;
  private pinLayer_: HTMLElement | null = null;

  private placeholder_: HTMLDivElement | null = null;
  private clone_: HTMLDivElement | null = null;

  private isPinned_ = false;
  private readonly unsubscribe_: Array<() => void> = [];
  private isInitialised_ = false;

  constructor(element: Element, options: { trigger: ScrollTrigger }) {
    this.element_ = element;
    this.scrollTrigger_ = options.trigger;
  }

  get scrollTrigger(): ScrollTrigger {
    return this.scrollTrigger_;
  }

  get pinnedElement(): Element {
    return this.element_;
  }

  /**
   * Re-measures layout-dependent values for the underlying element and
   * keeps the placeholder and clone in sync. Call this when layout changes
   * (resize, viewport scale changes, etc.).
   */
  refresh(): void {
    this.ensureInitialised();

    const rect = this.rootElement_!.getBoundingClientRect();

    const placeholderStyle = this.placeholder_!.style;
    placeholderStyle.width = `${rect.width}px`;
    placeholderStyle.height = `${rect.height}px`;

    if (this.isPinned_) {
      this.positionClone();
    }
  }

  /**
   * Begins pinning in the forward scroll direction.
   */
  pinForward(): void {
    this.pin();
  }

  /**
   * Begins pinning in the reverse scroll direction.
   */
  pinReverse(): void {
    this.pin();
  }

  /**
   * Ends pinning after a forward scroll, applying a translateY offset so
   * the original element appears to continue from the pinned position.
   *
   * The offset is expressed in viewport pixels and typically corresponds
   * to (triggerEndY - triggerStartY) from the scroll engine.
   */
  unpinForward(): void {
    if (!this.isPinned_) {
      return;
    }

    this.ensureInitialised();

    const section = this.element_.parent;
    const presentation = section.parent;
    const geometry = presentation.geometry;
    const scale = geometry.scale || 1;
    const start = this.scrollTrigger_.start;
    const end = this.scrollTrigger_.end;
    const offsetPx = (end - start) * scale;

    this.rootElement_!.style.transform = `translateY(${offsetPx}px)`;

    this.clone_!.style.visibility = "hidden";
    this.rootElement_!.style.visibility = "visible";

    this.isPinned_ = false;
  }

  /**
   * Ends pinning during reverse scroll: restores original visibility and
   * clears any transform previously applied during forward pinning.
   */
  unpinReverse(): void {
    if (!this.isPinned_) {
      return;
    }

    this.ensureInitialised();

    this.clone_!.style.visibility = "hidden";
    this.rootElement_!.style.visibility = "visible";
    this.rootElement_!.style.transform = "";

    this.isPinned_ = false;
  }

  /**
   * Cleans up DOM artifacts created by this instance.
   */
  destroy(): void {
    this.unsubscribe_.forEach((unsubscribe) => unsubscribe());
    this.unsubscribe_.length = 0;

    if (this.clone_) {
      this.clone_.remove();
      this.clone_ = null;
    }

    if (this.placeholder_) {
      this.placeholder_.remove();
      this.placeholder_ = null;
    }
  }

  /** Internal: position the clone within the pin layer. */
  private positionClone(): void {
    this.ensureInitialised();

    const rect = this.rootElement_!.getBoundingClientRect();
    const layerRect = this.pinLayer_!.getBoundingClientRect();

    const style = this.clone_!.style;
    style.top = `${Math.round(rect.top - layerRect.top)}px`;
    style.left = `${Math.round(rect.left - layerRect.left)}px`;
    style.width = `${rect.width}px`;
    style.height = `${rect.height}px`;
  }

  /** Internal: low-level pin implementation shared by forward/reverse. */
  private pin(): void {
    if (this.isPinned_) {
      return;
    }

    this.ensureInitialised();

    this.positionClone();

    this.clone_!.style.visibility = "visible";
    this.rootElement_!.style.visibility = "hidden";

    this.isPinned_ = true;
  }

  /** Lazily create DOM artifacts and wire trigger events the first time needed. */
  private ensureInitialised(): void {
    if (this.isInitialised_) {
      return;
    }

    const view = this.element_.view;
    if (!(view instanceof HTMLElementView)) {
      throw new Error(
        "HTMLPin expected Element.view to be an instance of HTMLElementView",
      );
    }

    if (!view.isRealised) {
      throw new Error("HTMLPin used before HTMLElementView.realise()");
    }

    const rootElement = view.rootElement;
    this.rootElement_ = rootElement;

    const section = this.element_.parent;
    const presentation = section.parent;
    const presentationView = presentation.view;
    if (!(presentationView instanceof HTMLPresentationView)) {
      throw new Error(
        "HTMLPin expected Presentation.view to be an instance of HTMLPresentationView",
      );
    }

    const pinLayer = presentationView.pinnedElementsContainer;
    this.pinLayer_ = pinLayer;

    const rect = rootElement.getBoundingClientRect();

    const placeholder = document.createElement("div");
    const placeholderStyle = placeholder.style;
    placeholderStyle.width = `${rect.width}px`;
    placeholderStyle.height = `${rect.height}px`;
    placeholderStyle.flexShrink = "0";
    placeholderStyle.pointerEvents = "none";
    this.placeholder_ = placeholder;

    placeholder.classList.add("pin-placeholder");

    const parentNode = rootElement.parentNode;
    if (!parentNode) {
      throw new Error("HTMLPin: root element has no parent node");
    }
    parentNode.insertBefore(placeholder, rootElement);

    const clone = rootElement.cloneNode(true) as HTMLDivElement;
    const cloneStyle = clone.style;
    cloneStyle.position = "absolute";
    cloneStyle.visibility = "hidden";
    cloneStyle.margin = "0";
    cloneStyle.pointerEvents = "auto";
    cloneStyle.zIndex = "1000";

    clone.classList.add("pin-clone");

    pinLayer.appendChild(clone);
    this.clone_ = clone;

    // Wire the associated ScrollTrigger lifecycle events to this pin.
    this.unsubscribe_.push(
      this.scrollTrigger_.on("start", () => {
        this.pinForward();
      }),
      this.scrollTrigger_.on("reverseStart", () => {
        this.pinReverse();
      }),
      this.scrollTrigger_.on("end", () => {
        this.unpinForward();
      }),
      this.scrollTrigger_.on("reverseEnd", () => {
        this.unpinReverse();
      }),
    );

    this.isInitialised_ = true;
  }
}
