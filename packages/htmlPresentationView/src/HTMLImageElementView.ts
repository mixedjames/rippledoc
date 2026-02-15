import { HTMLElementView } from "./HTMLElementView";
import { ImageElement } from "@rippledoc/presentation";

export class HTMLImageElementView extends HTMLElementView {
  private readonly imageElement_: ImageElement;

  constructor(options: { element: ImageElement }) {
    super(options);
    this.imageElement_ = options.element;
  }

  override realise(): void {
    super.realise();

    const root = this.rootElement;
    if (!root) {
      throw new Error(
        "HTMLImageElementView.realise() called before HTMLElementView.realise()",
      );
    }

    // Clear any existing content before inserting the image.
    root.innerHTML = "";

    const source = this.imageElement_.source;
    const fit = this.imageElement_.fit;
    const altText = this.imageElement_.altText;
    const lower = source.toLowerCase();
    const match = lower.match(/\.([a-z0-9]+)(?:[#?].*)?$/);
    const ext = match?.[1];

    if (ext === "svg") {
      this.realiseSvgImage(root, source, fit, altText);
    } else {
      this.realiseBitmapImage(root, source, fit, altText);
    }
  }

  private realiseSvgImage(
    root: HTMLElement,
    source: string,
    fit: ImageElement["fit"],
    altText: string,
  ): void {
    // Fetch the SVG and inline it into the DOM.
    fetch(source)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTMLImageElementView: failed to fetch SVG from "${source}"`,
          );
        }
        return response.text();
      })
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;

        if (!svg || svg.nodeName.toLowerCase() !== "svg") {
          return;
        }

        // Fudge: we want to import the SVG into the current document, but TypeScript doesn't know
        // that the result of importNode will be an SVGElement, so we have to assert it as unknown
        // first.
        const imported = document.importNode(
          svg,
          true,
        ) as unknown as SVGElement;

        imported.setAttribute("data-image-source", source);
        imported.setAttribute("width", "100%");
        imported.setAttribute("height", "100%");
        imported.style.display = "block";
        imported.style.position = "absolute";
        imported.style.left = "0";
        imported.style.top = "0";

        // Approximate fit behaviour for inline SVG.
        switch (fit) {
          case "cover":
            imported.style.objectFit = "cover" as unknown as string;
            break;
          case "fill":
            imported.style.objectFit = "fill" as unknown as string;
            break;
          case "contain":
          default:
            imported.style.objectFit = "contain" as unknown as string;
            break;
        }

        if (altText && altText.trim() !== "") {
          imported.setAttribute("role", "img");
          imported.setAttribute("aria-label", altText);
        }

        root.appendChild(imported);
      })
      .catch((error) => {
        // For now, fail silently except for a console diagnostic.
        // Callers still get the label even if the image fails to load.
        // //eslint-disable-next-line no-console
        console.error(error);
      });
  }

  private realiseBitmapImage(
    root: HTMLElement,
    source: string,
    fit: ImageElement["fit"],
    altText: string,
  ): void {
    // Bitmap path: create an <img> element and use source as src.
    const img = document.createElement("img");
    img.src = source;
    img.alt = altText;
    img.style.display = "block";
    img.style.position = "absolute";
    img.style.left = "0";
    img.style.top = "0";
    img.style.width = "100%";
    img.style.height = "100%";

    switch (fit) {
      case "cover":
        img.style.objectFit = "cover";
        break;
      case "fill":
        img.style.objectFit = "fill";
        break;
      case "contain":
      default:
        img.style.objectFit = "contain";
        break;
    }
    root.appendChild(img);
  }

  override layout(): void {
    super.layout();
  }
}
