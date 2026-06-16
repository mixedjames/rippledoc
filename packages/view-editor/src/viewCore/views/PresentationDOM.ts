import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorPresentationView } from "./EditorPresentationView";
import type { ViewMode } from "../../clientAPI/ViewMode";

/**
 * Manages the DOM structure for an editor presentation view.
 *
 * DOM hierarchy (inside a Shadow DOM for style encapsulation):
 *
 *   container (caller-supplied HTMLElement)
 *     root (div)
 *       shadowRoot
 *         styles (style)
 *         viewport (div, overflow-y:auto, tabIndex=0 — the scroll and keyboard container)
 *           backgrounds (div — one child per section, for section backgrounds)
 *           elements   (div — one child per element, in global virtual coords)
 *         overlay (div, pointer-events:none — future: anchor handles, selection UI)
 *           pins (div)
 *
 * backgrounds and elements are both absolutely positioned and sized to
 * basisWidth × totalHeight (scaled). Elements use global virtual coordinates, so
 * they are positioned directly within the elements div regardless of which section
 * owns them.
 *
 * Mode is surfaced as a data-mode attribute on the viewport. CSS rules inside this
 * shadow root use it to change rendering without requiring a JS cascade through
 * the view hierarchy (e.g. hiding element content in anchors mode).
 */
export class PresentationDOM {
  private readonly presentationView_: EditorPresentationView;
  private readonly containerElement_: HTMLElement;

  private readonly root_: HTMLElement = document.createElement("div");
  private readonly shadowRoot_: ShadowRoot;

  private readonly styles_: HTMLStyleElement = document.createElement("style");
  private readonly viewport_: HTMLElement = document.createElement("div");
  private readonly backgrounds_: HTMLElement = document.createElement("div");
  private readonly elements_: HTMLElement = document.createElement("div");
  private readonly overlay_: HTMLElement = document.createElement("div");
  private readonly pins_: HTMLElement = document.createElement("div");

  constructor(
    presentationView: EditorPresentationView,
    container: HTMLElement | string,
  ) {
    this.presentationView_ = presentationView;
    this.containerElement_ = this.resolveContainer_(container);
    this.shadowRoot_ = this.root_.attachShadow({ mode: "open" });
    this.buildDOM_();
    this.containerElement_.appendChild(this.root_);
  }

  layout(transform: p4.LayoutTransform): void {
    const { scale, tx } = transform;
    const basisWidth = this.presentationView_.owner.root.basisWidth;
    const totalHeight = this.presentationView_.owner.root.totalHeight;

    for (const el of [this.backgrounds_, this.elements_]) {
      el.style.left = `${tx}px`;
      el.style.width = `${basisWidth * scale}px`;
      el.style.height = `${totalHeight * scale}px`;
    }
  }

  /** Set the current view mode. CSS rules react to this to adjust rendering. */
  setMode(mode: ViewMode): void {
    this.viewport_.dataset.mode = mode;
    this.pins_.dataset.mode = mode;
  }

  destroy(): void {
    this.root_.remove();
  }

  get containerElement(): HTMLElement {
    return this.containerElement_;
  }

  get viewportContainer(): HTMLElement {
    return this.viewport_;
  }

  get backgroundsContainer(): HTMLElement {
    return this.backgrounds_;
  }

  get elementsContainer(): HTMLElement {
    return this.elements_;
  }

  get pinsContainer(): HTMLElement {
    return this.pins_;
  }

  private resolveContainer_(container: HTMLElement | string): HTMLElement {
    if (container instanceof HTMLElement) return container;
    const el = document.querySelector(container);
    if (!el) throw new Error(`Container element not found: "${container}"`);
    if (!(el instanceof HTMLElement))
      throw new Error(`Container is not an HTMLElement: "${container}"`);
    return el;
  }

  private buildDOM_(): void {
    // Wire the tree.
    this.shadowRoot_.appendChild(this.styles_);
    this.shadowRoot_.appendChild(this.viewport_);
    this.viewport_.appendChild(this.backgrounds_);
    this.viewport_.appendChild(this.elements_);
    this.shadowRoot_.appendChild(this.overlay_);
    this.overlay_.appendChild(this.pins_);

    // Class names for external styling and test selection.
    this.viewport_.classList.add("viewport");
    this.backgrounds_.classList.add("backgrounds");
    this.elements_.classList.add("elements");
    this.overlay_.classList.add("overlay");
    this.pins_.classList.add("pins");

    // tabIndex allows the viewport to receive keyboard focus when the user
    // clicks inside the presentation. outline:none suppresses the focus ring
    // (the editor provides its own selection chrome).
    this.viewport_.tabIndex = 0;
    this.viewport_.style.outline = "none";

    this.styles_.textContent = `
      .element {
        box-sizing: border-box;
        overflow: hidden;
      }

      .section-background {
        box-sizing: border-box;
      }

      /* Selection chrome: outline sits above author border without affecting layout.
         Suppressed in player mode where editor chrome should not be visible. */
      .viewport:not([data-mode="player"]) .element.selected,
      .pins:not([data-mode="player"]) .element.selected {
        outline: 2px solid hsl(220 80% 55%);
        outline-offset: 1px;
      }

      /* Anchors mode: hide rendered content so only element boxes are visible. */
      [data-mode="anchors"] .element-content {
        display: none;
      }
    `;

    // All layers fill the container absolutely.
    for (const el of [
      this.viewport_,
      this.overlay_,
      this.backgrounds_,
      this.elements_,
      this.pins_,
    ]) {
      el.style.position = "absolute";
      el.style.left = "0";
      el.style.top = "0";
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.boxSizing = "border-box";
    }

    // viewport is the scroll container.
    this.viewport_.style.overflowX = "hidden";
    this.viewport_.style.overflowY = "auto";

    // elements layer must overflow to show content beyond the viewport height.
    this.elements_.style.overflow = "visible";

    // overlay must not intercept pointer events (contains non-interactive chrome).
    this.overlay_.style.pointerEvents = "none";

    // root fills its container.
    this.root_.style.position = "absolute";
    this.root_.style.left = "0";
    this.root_.style.top = "0";
    this.root_.style.width = "100%";
    this.root_.style.height = "100%";
  }
}
