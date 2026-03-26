import { SectionBuilder } from "../section/SectionBuilder";
import { loadTextBoxElement } from "./loadTextBoxElement";
import { loadImageElement } from "./loadImageElement";

export function loadElement(options: {
  element: Element;
  sectionBuilder: SectionBuilder;
}): void {
  const { element, sectionBuilder } = options;

  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case "textbox":
      loadTextBoxElement({ element, sectionBuilder });
      break;

    case "image":
      loadImageElement({ element, sectionBuilder });
      break;

    default:
      // Unknown child elements are ignored for now. Consider tightening this
      // behaviour once the XML schema is stable.
      break;
  }
}
