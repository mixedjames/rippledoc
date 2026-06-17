/** A titled panel with an expand/collapse toggle. Wraps any content element. */
export class CollapsiblePanel {
  readonly element: HTMLElement;
  private collapsed_ = false;
  private toggle_: HTMLElement;

  constructor(title: string, content: HTMLElement) {
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
    header.addEventListener("click", () => this.toggleCollapsed_());

    const body = document.createElement("div");
    body.className = "re-panel__body";
    body.appendChild(content);

    this.element.appendChild(header);
    this.element.appendChild(body);
  }

  private toggleCollapsed_(): void {
    this.collapsed_ = !this.collapsed_;
    this.element.classList.toggle("re-panel--collapsed", this.collapsed_);
  }
}
