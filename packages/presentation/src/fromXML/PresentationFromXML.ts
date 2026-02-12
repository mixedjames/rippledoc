import type { ViewFactory } from "../view/ViewFactory";
import type { Presentation } from "../Presentation";
import { PresentationBuilder } from "../builder/PresentationBuilder";
import { ImageFit } from "../ImageElement";

export interface PresentationFromXMLConfig {
  viewFactory: ViewFactory;
  url?: string | URL;
  text?: string;
}

/**
 * Build a Presentation from XML using either a URL or an in-memory string.
 *
 * Exactly one of `url` or `text` must be provided.
 */
export async function presentationFromXML(
  config: PresentationFromXMLConfig,
): Promise<Presentation> {
  const xmlText = await loadXmlSource(config);
  const xmlDoc = parseXmlDocument(xmlText);
  return buildPresentationFromDocument(xmlDoc, config.viewFactory);
}

async function loadXmlSource(
  config: PresentationFromXMLConfig,
): Promise<string> {
  const { url, text } = config;

  if ((url && text) || (!url && !text)) {
    throw new Error(
      "presentationFromXML: exactly one of 'url' or 'text' must be provided",
    );
  }

  if (typeof text === "string") {
    return text;
  }

  // At this point we know url is defined.
  const response = await fetch(url!);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.statusText}`);
  }
  return response.text();
}

function parseXmlDocument(xmlText: string): Document {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent ?? ""}`);
  }
  return xmlDoc;
}

function buildPresentationFromDocument(
  xmlDoc: Document,
  viewFactory: ViewFactory,
): Presentation {
  const builder = new PresentationBuilder({ viewFactory });

  // Parse <slideSize>
  const slideSize = xmlDoc.querySelector("slideSize");
  if (!slideSize) {
    throw new Error("Missing required <slideSize> element");
  }

  const width = slideSize.getAttribute("w");
  const height = slideSize.getAttribute("h");
  if (!width || !height) {
    throw new Error("<slideSize> must have both w and h attributes");
  }

  builder.setSlideWidth(Number(width));
  builder.setSlideHeight(Number(height));

  // Parse <section> and <element> elements
  loadSectionsFromDocument(xmlDoc, builder);

  return builder.build();
}

function loadSectionsFromDocument(
  xmlDoc: Document,
  builder: PresentationBuilder,
): void {
  const sections = xmlDoc.querySelectorAll("section");
  sections.forEach((sectionEl) => {
    const section = builder.createSection();
    loadSection(sectionEl, section);
  });
}

function loadSection(
  sectionEl: Element,
  section: ReturnType<PresentationBuilder["createSection"]>,
): void {
  const nameAttr = sectionEl.getAttribute("name");
  if (nameAttr && nameAttr.trim() !== "") {
    section.setName(nameAttr);
  }

  const h = sectionEl.getAttribute("h");
  const b = sectionEl.getAttribute("b");

  // Set whichever is non-empty
  if (h && h.trim() !== "") {
    section.setHeight(h);
  }

  if (b && b.trim() !== "") {
    section.setBottom(b);
  }

  // Parse child elements in document order, supporting both
  // <fill>, <element> and <image> nodes.
  Array.from(sectionEl.children).forEach((child) => {
    const tag = child.tagName;
    if (tag === "fill") {
      loadFill(child, section);
      return;
    }

    if (tag === "element") {
      const element = section.createElement();
      loadElement(child, element);
      return;
    }

    if (tag === "image") {
      const image = section.createImageElement();
      loadElement(child, image);

      const source = child.getAttribute("source");
      if (!source || source.trim() === "") {
        throw new Error(
          "<image> element must have a non-empty 'source' attribute",
        );
      }

      image.setSource(source);

      const fitAttr = child.getAttribute("fit");
      if (fitAttr && fitAttr.trim() !== "") {
        const fitNormalized = fitAttr.trim().toLowerCase();
        let fit: ImageFit | null = null;

        switch (fitNormalized) {
          case ImageFit.Fill:
            fit = ImageFit.Fill;
            break;
          case ImageFit.Contain:
            fit = ImageFit.Contain;
            break;
          case ImageFit.Cover:
            fit = ImageFit.Cover;
            break;
        }

        if (!fit) {
          throw new Error(
            `<image> element has invalid 'fit' value "${fitAttr}"`,
          );
        }

        image.setFit(fit);
      }

      const altAttr = child.getAttribute("alt");
      if (altAttr !== null) {
        image.setAltText(altAttr);
      }
    }
  });
}

function loadFill(
  fillEl: Element,
  section: ReturnType<PresentationBuilder["createSection"]>,
): void {
  const colorAttr = fillEl.getAttribute("color");
  const imageAttr = fillEl.getAttribute("image");

  if (colorAttr && colorAttr.trim() !== "") {
    const color = parseHexColor(colorAttr);
    section.style.fill.setColor(color);
  }

  if (imageAttr && imageAttr.trim() !== "") {
    section.style.fill.setImageSource(imageAttr.trim());
  }
}

function parseHexColor(color: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const trimmed = color.trim();
  const match = /^#([0-9a-fA-F]{6})$/.exec(trimmed);

  if (!match) {
    throw new Error(
      `Invalid color format "${color}". Expected "#RRGGBB" (e.g. "#00FF00").`,
    );
  }

  const hex = match[1]!;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b, a: 255 };
}

type ElementLikeBuilder = {
  setName(name: string): void;
  setLeft(expr: string): void;
  setRight(expr: string): void;
  setWidth(expr: string): void;
  setTop(expr: string): void;
  setBottom(expr: string): void;
  setHeight(expr: string): void;
};

function loadElement(elementEl: Element, element: ElementLikeBuilder): void {
  const l = elementEl.getAttribute("l");
  const r = elementEl.getAttribute("r");
  const w = elementEl.getAttribute("w");
  const t = elementEl.getAttribute("t");
  const bEl = elementEl.getAttribute("b");
  const hEl = elementEl.getAttribute("h");
  const nameAttr = elementEl.getAttribute("name");

  if (nameAttr && nameAttr.trim() !== "") {
    element.setName(nameAttr);
  }

  // Set each non-empty attribute
  if (l && l.trim() !== "") {
    element.setLeft(l);
  }

  if (r && r.trim() !== "") {
    element.setRight(r);
  }

  if (w && w.trim() !== "") {
    element.setWidth(w);
  }

  if (t && t.trim() !== "") {
    element.setTop(t);
  }

  if (bEl && bEl.trim() !== "") {
    element.setBottom(bEl);
  }

  if (hEl && hEl.trim() !== "") {
    element.setHeight(hEl);
  }
}
