import { ImageFit } from "@rippledoc/presentation";
import { sanitizeHTML } from "@rippledoc/sanitizer";
import { PresentationBuilder } from "../builder/PresentationBuilder";
import { loadFill } from "./xmlStyleUtils";
import { loadScrollTrigger } from "./scrollTriggerFromXML";
import { loadElement } from "./elementFromXML";

export function loadSectionsFromDocument(
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

  // Parse child elements in document order, supporting
  // <fill>, <scroll-trigger>, <element>, <image> and <textbox> nodes.
  Array.from(sectionEl.children).forEach((child) => {
    const tag = child.tagName;
    if (tag === "fill") {
      loadFill(child, section);
      return;
    }

    if (tag === "scroll-trigger") {
      loadScrollTrigger(child, {
        createScrollTrigger: () => section.createScrollTrigger(),
      });
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
        const fitNormalized: ImageFit = fitAttr
          .trim()
          .toLowerCase() as ImageFit;
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

      return;
    }

    if (tag === "textbox") {
      const textbox = section.createHTMLFragmentElement();
      loadElement(child, textbox);

      const rawHtml = child.innerHTML ?? "";
      const sanitized = sanitizeHTML(rawHtml);

      const template = document.createElement("template");
      template.innerHTML = sanitized;
      const fragment = template.content;

      textbox.setFragment(fragment);
      return;
    }
  });
}
