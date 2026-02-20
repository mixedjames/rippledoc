import type { Presentation } from "@rippledoc/presentation";

/**
 * Helper responsible for rendering scroll trigger markers for an HTMLPresentationView.
 *
 * This class is intentionally separate so that trigger visualisation can be
 * created lazily and kept out of the core presentation view hot path.
 */
export class HTMLTriggerMarkers {
  private readonly presentation_: Presentation;
  private readonly container_: HTMLElement;

  private overlay_: HTMLDivElement | null = null;
  private visible_ = false;

  constructor(options: { presentation: Presentation; container: HTMLElement }) {
    const { presentation, container } = options;
    this.presentation_ = presentation;
    this.container_ = container;
  }

  setVisible(visible: boolean): void {
    if (!visible) {
      this.visible_ = false;
      this.removeOverlay();
      return;
    }

    this.visible_ = true;
    this.ensureOverlay();
    this.relayout();
  }

  /**
   * Recompute marker positions based on the presentation's current geometry
   * and scroll trigger descriptors.
   */
  relayout(): void {
    if (!this.visible_ || !this.overlay_) {
      return;
    }

    const triggers = this.presentation_.scrollTriggers;

    // Clear existing markers.
    this.overlay_.innerHTML = "";

    if (!triggers || triggers.length === 0) {
      return;
    }

    const geometry = this.presentation_.geometry;
    const scale = geometry.scale;
    const tx = geometry.tx;
    const basisWidth = geometry.basis.width;

    triggers.forEach((trigger, index) => {
      const start = trigger.start;
      const end = trigger.end;
      const startY = start * scale;
      const endY = end * scale;

      // Basic debug logging so demo users can confirm mapping.
      // Intentionally kept lightweight.

      console.log("[HTMLTriggerMarkers] trigger", index, {
        start,
        end,
        startY,
        endY,
      });

      const makeLine = (y: number, type: "start" | "end") => {
        const line = document.createElement("div");
        line.className = `scroll-trigger-line scroll-trigger-line-${type}`;
        const style = line.style;
        style.position = "absolute";
        style.left = `${tx}px`;
        style.width = `${basisWidth * scale}px`;
        style.top = `${y}px`;
        return line;
      };

      this.overlay_!.appendChild(makeLine(startY, "start"));
      this.overlay_!.appendChild(makeLine(endY, "end"));
    });
  }

  private ensureOverlay(): void {
    if (this.overlay_) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "scroll-trigger-overlay";
    const style = overlay.style;
    style.position = "absolute";
    style.left = "0";
    style.top = "0";
    style.right = "0";
    style.bottom = "0";
    style.pointerEvents = "none";

    this.container_.appendChild(overlay);
    this.overlay_ = overlay;
  }

  private removeOverlay(): void {
    if (!this.overlay_) {
      return;
    }

    if (this.overlay_.parentElement === this.container_) {
      this.container_.removeChild(this.overlay_);
    }

    this.overlay_ = null;
  }
}
