import { HTMLElementView } from "../../htmlView/HTMLElementView";
import { ImageElement, ImageFit } from "../ImageElement";
import { HTMLSectionView } from "../../../section/htmlView/HTMLSectionView";
import { sanitizeSVG } from "@rippledoc/sanitizer";

export class HTMLImageElementView extends HTMLElementView {
  constructor(options: {
    sectionView: HTMLSectionView;
    element: ImageElement;
  }) {
    super({ ...options, subclass: true });

    this.createDOM();
  }

  get element(): ImageElement {
    // We know that this is a ImageElement, so we can cast it here.
    return super.element as ImageElement;
  }

  protected subclassCreateDOM(): void {
    this.htmlElement.classList.add("rdoc-image-element");

    if (this.getFileExtension(this.element.source) === "svg") {
      this.createSVG();
    } else {
      this.createBitmap();
    }
  }

  private createBitmap(): void {
    const img = document.createElement("img");

    img.src = this.element.source;
    img.style.width = "100%";
    img.style.height = "100%";

    switch (this.element.fit) {
      case ImageFit.Fill:
        img.style.objectFit = "fill";
        break;
      case ImageFit.Contain:
        img.style.objectFit = "contain";
        break;
      case ImageFit.Cover:
        img.style.objectFit = "cover";
        break;
    }

    this.htmlElement.appendChild(img);
  }

  private createSVG(): void {
    fetch(this.element.source)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTMLImageElementView: failed to fetch SVG from "${this.element.source}"`,
          );
        }

        return response.text();
      })
      .then((svgText) => {
        const sanitized = sanitizeSVG(svgText);
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitized, "image/svg+xml");
        const svg = doc.documentElement;

        // Fudge: we want to import the SVG into the current document, but TypeScript doesn't know
        // that the result of importNode will be an SVGElement, so we have to assert it as unknown
        // first.
        const imported = document.importNode(
          svg,
          true,
        ) as unknown as SVGElement;

        imported.setAttribute("data-image-source", this.element.source);
        imported.setAttribute("width", "100%");
        imported.setAttribute("height", "100%");
        imported.style.display = "block";
        imported.style.position = "absolute";
        imported.style.left = "0";
        imported.style.top = "0";

        this.htmlElement.appendChild(imported);
        this.animatableObjectChanges();
      })
      .catch((error) => {
        // For now, fail silently except for a console diagnostic.
        // Callers still get the label even if the image fails to load.
        // //eslint-disable-next-line no-console
        console.error(error);
      });
  }

  protected subclassLayout(): void {}

  private getFileExtension(filename: string): string {
    // My understanding of this fancy-pants reg-ex:
    // /\.([a-z0-9]+)(?:[#?].*)?$/
    //    - \. means match literal '.'
    //    - ([a-z0-9]+) means capturing group (i.e. store) the next sequence of one or more
    //      characters or digits.
    //    - (?:[#?].*) means non-capturing group (i.e. forget) the next sequence of '#' or '?'
    //      followed by any combination of characters
    //    - $ means match the end-of-sequence marker
    //
    // Needed so that we can match fancy-pants urls like...
    //  im-a-normal-filename.svg
    //  my-pants-are-fancy.png?size=large and return 'png'
    //  im-even-fancier.longExtension?x=1#y=2

    const lowercase = filename.toLowerCase();
    const match = lowercase.match(/\.([a-z0-9]+)(?:[#?].*)?$/);

    if (!match || match.length < 2 || !match[1]) {
      return "";
    }

    return match[1];
  }
}
