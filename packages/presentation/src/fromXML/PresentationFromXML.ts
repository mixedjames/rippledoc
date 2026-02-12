import type { ViewFactory } from "../view/ViewFactory";
import type { Presentation } from "../Presentation";
import { PresentationBuilder } from "../builder/PresentationBuilder";

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
  // <element> and <image> nodes.
  Array.from(sectionEl.children).forEach((child) => {
    const tag = child.tagName;
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
    }
  });
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
