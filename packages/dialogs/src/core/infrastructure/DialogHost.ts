/**
 * Manages the modal overlay. One dialog is shown at a time.
 *
 * Callers pass a builder to show(). The builder receives a close() function and
 * returns { element, onDismiss }. The host calls onDismiss() when the user
 * presses Escape or clicks the backdrop; onDismiss() should call close() with
 * the appropriate cancelled result.
 */
export class DialogHost {
  private readonly backdrop_: HTMLElement;
  private readonly container_: HTMLElement;
  private dismissCb_: (() => void) | null = null;
  private escapeHandler_: ((e: KeyboardEvent) => void) | null = null;
  private previousFocus_: HTMLElement | null = null;

  constructor(mountPoint: HTMLElement) {
    this.backdrop_ = document.createElement("div");
    this.backdrop_.className = "rdoc-dlg-backdrop";
    this.container_ = document.createElement("div");
    this.container_.className = "rdoc-dlg-box";
    this.backdrop_.appendChild(this.container_);
    mountPoint.appendChild(this.backdrop_);

    this.backdrop_.addEventListener("click", (e) => {
      if (e.target === this.backdrop_) this.dismissCb_?.();
    });
  }

  show<T>(
    builder: (close: (result: T) => void) => { element: HTMLElement; onDismiss: () => void },
  ): Promise<T> {
    return new Promise((resolve) => {
      const close = (result: T): void => {
        this.cleanup_();
        resolve(result);
      };

      const { element, onDismiss } = builder(close);
      this.dismissCb_ = onDismiss;

      this.container_.innerHTML = "";
      this.container_.appendChild(element);
      this.backdrop_.classList.add("rdoc-dlg-backdrop--open");

      this.previousFocus_ =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      this.escapeHandler_ = (e: KeyboardEvent): void => {
        if (e.key === "Escape") onDismiss();
      };
      document.addEventListener("keydown", this.escapeHandler_);

      const first = element.querySelector<HTMLElement>("button, input, select, [tabindex]");
      first?.focus();
    });
  }

  private cleanup_(): void {
    this.backdrop_.classList.remove("rdoc-dlg-backdrop--open");
    if (this.escapeHandler_) {
      document.removeEventListener("keydown", this.escapeHandler_);
      this.escapeHandler_ = null;
    }
    this.dismissCb_ = null;
    this.container_.innerHTML = "";
    this.previousFocus_?.focus();
    this.previousFocus_ = null;
  }
}
