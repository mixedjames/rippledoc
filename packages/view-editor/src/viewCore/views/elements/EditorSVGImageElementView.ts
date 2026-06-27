import type * as p4 from "@rippledoc/presentation4/viewAPI";
import { sanitizeSVG } from "@rippledoc/sanitizer";
import type { EditorSectionView } from "../EditorSectionView";
import { EditorElementView } from "./EditorElementView";

export class EditorSVGImageElementView extends EditorElementView {
  private readonly svgOwner_: p4.SVGImageElementViewOwner;
  private readonly abort_: AbortController = new AbortController();
  private readonly unsubscribeSrc_: () => void;

  constructor(owner: p4.SVGImageElementViewOwner, parent: EditorSectionView) {
    super(owner, parent);
    this.svgOwner_ = owner;
    this.element.classList.add("svg-image-element");

    // Match bitmap image layout: contentElement needs explicit height so the
    // child SVG can resolve height:100% against the outer element's pixel height.
    this.contentElement.style.height = "100%";
    this.element.style.overflow = "hidden";

    const pres = owner.sectionViewOwner.presentationViewOwner;
    this.unsubscribeSrc_ = pres.events.on(
      "element:srcChanged",
      ({ element, src }) => {
        if (element === this.svgOwner_) this.loadSVG_(src);
      },
    );

    this.loadSVG_(owner.src);
  }

  override destroy(): void {
    this.unsubscribeSrc_();
    this.abort_.abort();
    super.destroy();
  }

  protected override getSubTargetResolver(): (
    selector: string,
  ) => Element | null {
    return (selector: string): Element | null => {
      const svg = this.contentElement.querySelector("svg");
      return svg ? svg.querySelector(selector) : null;
    };
  }

  private loadSVG_(src: string): void {
    // Clear existing content and insert a placeholder while the fetch runs.
    this.contentElement.innerHTML = "";
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

        // Parse as HTML, not as image/svg+xml. DOMPurify serialises its output
        // through innerHTML (HTML serialisation), which omits xmlns declarations.
        // Feeding that to an XML parser produces a <parseerror> document whose
        // text content then appears in the page. HTML5 parsers handle SVG in
        // foreign-content mode correctly without requiring an explicit xmlns.
        const parser = new DOMParser();
        const doc = parser.parseFromString(
          `<!doctype html><body>${sanitized}`,
          "text/html",
        );
        const svg = doc.querySelector("svg");
        if (!svg) return;

        const imported = document.importNode(svg, true) as SVGElement;
        imported.setAttribute("width", "100%");
        imported.setAttribute("height", "100%");
        imported.style.display = "block";

        placeholder.replaceWith(imported);

        this.notifyContentChanged();
        this.notifySubComponentsChanged();
      })
      .catch((err) => {
        if (this.abort_.signal.aborted) return;
        console.error(err);
      });
  }
}
