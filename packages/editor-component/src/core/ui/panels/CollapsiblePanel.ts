/**
 * A titled accordion panel whose open/close state is controlled externally by `Sidebar`.
 * Fires `onOpen` when the header is clicked; the caller decides whether to open this
 * panel (and close others) by calling `open()` / `close()`.
 */
export class CollapsiblePanel {
  readonly element: HTMLElement;
  private toggle_: HTMLElement;
  private body_: HTMLElement;

  constructor(title: string, content: HTMLElement, onOpen: () => void) {
    this.element = document.createElement("div");
    this.element.className = "re-panel";

    const header = document.createElement("button");
    header.className = "re-panel__header";
    header.type = "button";

    const titleEl = document.createElement("span");
    titleEl.className = "re-panel__title";
    titleEl.textContent = title;

    this.toggle_ = document.createElement("span");
    this.toggle_.className = "re-panel__toggle";
    this.toggle_.textContent = "▾";

    header.appendChild(titleEl);
    header.appendChild(this.toggle_);
    header.addEventListener("click", onOpen);

    this.body_ = document.createElement("div");
    this.body_.className = "re-panel__body";
    this.body_.appendChild(content);

    this.element.appendChild(header);
    this.element.appendChild(this.body_);
  }

  open(): void {
    this.element.classList.add("re-panel--open");
  }

  close(): void {
    this.element.classList.remove("re-panel--open");
  }
}
