import {
  HTMLElementView,
  HTMLElementViewLinkedClone,
} from "../../htmlView/HTMLElementView";
import { ImageElement, ImageFit } from "../ImageElement";
import { HTMLSectionView } from "../../../section/htmlView/HTMLSectionView";
import { sanitizeSVG } from "@rippledoc/sanitizer";

/**
 * Represents the browsers basic Element type.
 *
 * Exists because I made an error in naming elements on my custom DOM and we now have two different
 * Element types in this codebase - the browser's native Element, and our custom Element class.
 */
type DOMElement = globalThis.Element;

enum ImageType {
  Bitmap,
  SVG,
}

class HTMLImageElementViewLinkedClone extends HTMLElementViewLinkedClone {
  get elementView(): HTMLImageElementView {
    // We know that this is a HTMLImageElementView, so we can cast it here.
    return super.elementView as HTMLImageElementView;
  }

  get allowsSubComponentElements(): boolean {
    return this.elementView.allowsSubComponentElements;
  }

  get svgElement(): SVGElement {
    const svgElement = this.htmlElement.querySelector("svg") as SVGElement;

    if (!svgElement) {
      throw new Error(
        "HTMLImageElementViewLinkedClone: no SVG element found in linked clone.",
      );
    }

    return svgElement;
  }

  getSubComponentElement(name: string): DOMElement {
    const elementView = this.elementView;
    const svg = this.svgElement;

    if (elementView.type !== ImageType.SVG) {
      throw new Error(
        "HTMLImageElementView: bitmap images do not support sub-component elements.",
      );
    }

    if (svg.hasAttribute("temporaryElement")) {
      const tmp = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svg.appendChild(tmp);
      return tmp;
    }

    const subComponentElement = svg.querySelector<SVGElement>(`[id="${name}"]`);

    if (!subComponentElement) {
      throw new Error(
        `HTMLImageElementView: no sub-component element with name "${name}" found in SVG image.`,
      );
    }

    return subComponentElement;
  }
}

export class HTMLImageElementView extends HTMLElementView {
  private type_: ImageType;
  private svgElement_: SVGElement | null = null;

  constructor(options: {
    sectionView: HTMLSectionView;
    element: ImageElement;
  }) {
    super({ ...options, subclass: true });

    this.type_ =
      this.getFileExtension(this.element.source) === "svg"
        ? ImageType.SVG
        : ImageType.Bitmap;
    this.createDOM();
  }

  get element(): ImageElement {
    // We know that this is a ImageElement, so we can cast it here.
    return super.element as ImageElement;
  }

  get type(): ImageType {
    return this.type_;
  }

  get svgElement(): SVGElement {
    if (this.type_ !== ImageType.SVG) {
      throw new Error(
        "HTMLImageElementView: only SVG images have sub-component elements.",
      );
    }
    return this.svgElement_!;
  }

  protected subclassCreateDOM(): void {
    this.htmlElement.classList.add("rdoc-image-element");

    if (this.type_ === ImageType.SVG) {
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
    this.svgElement_ = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    this.svgElement_.setAttribute("temporaryElement", "true");
    this.htmlElement.appendChild(this.svgElement_);

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

        // We know that this.svgElement_ is not null because we just created it above and haven't
        // removed it since, so we can assert it as non-null with the ! operator.
        this.svgElement_!.remove();
        this.svgElement_ = imported;

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

  get allowsSubComponentElements(): boolean {
    return this.type_ === ImageType.SVG;
  }

  /**
   *
   */
  getSubComponentElement(name: string): SVGElement {
    if (this.type_ === ImageType.SVG) {
      if (this.svgElement_!.hasAttribute("temporaryElement")) {
        const tmp = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svgElement_?.appendChild(tmp);
        return tmp;
      }

      const element = this.svgElement_!.querySelector<SVGElement>(
        `[id="${name}"]`,
      );
      if (element) {
        return element;
      }

      throw new Error(
        `HTMLImageElementView: no sub-component element with name "${name}" found in SVG image.`,
      );
    }

    throw new Error(
      "HTMLImageElementView: bitmap images do not support sub-component elements.",
    );
  }

  makeLinkedClone(): HTMLElementViewLinkedClone {
    return new HTMLImageElementViewLinkedClone(this);
  }
}
