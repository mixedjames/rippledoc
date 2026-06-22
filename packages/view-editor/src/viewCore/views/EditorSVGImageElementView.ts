import type * as p4 from "@rippledoc/presentation4/viewAPI";
import { sanitizeSVG } from "@rippledoc/sanitizer";
import type { EditorSectionView } from "./EditorSectionView";
import { EditorElementView } from "./EditorElementView";

export class EditorSVGImageElementView extends EditorElementView {
  private readonly abort_: AbortController = new AbortController();

  constructor(owner: p4.SVGImageElementViewOwner, parent: EditorSectionView) {
    super(owner, parent);
    this.element.classList.add("svg-image-element");
    this.loadSVG_(owner.src);
  }

  override destroy(): void {
    this.abort_.abort();
    super.destroy();
  }

  private loadSVG_(src: string): void {
    // Insert a temporary placeholder SVG so the element has content before the
    // fetch completes. The placeholder is replaced once the real SVG arrives.
    const placeholder = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    placeholder.setAttribute("width", "100%");
    placeholder.setAttribute("height", "100%");
    this.contentElement.appendChild(placeholder);

    fetch(src, { signal: this.abort_.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `EditorSVGImageElementView: failed to fetch "${src}" (${response.status})`,
          );
        }
        return response.text();
      })
      .then((svgText) => {
        const sanitized = sanitizeSVG(svgText);
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitized, "image/svg+xml");
        const imported = document.importNode(
          doc.documentElement,
          true,
        ) as unknown as SVGElement;

        imported.setAttribute("width", "100%");
        imported.setAttribute("height", "100%");
        imported.style.display = "block";

        placeholder.replaceWith(imported);

        this.notifyContentChanged();
      })
      .catch((err) => {
        if (this.abort_.signal.aborted) return;
        console.error(err);
      });
  }
}
