import { PresentationBuilder } from "../..";
import { SectionBuilder } from "../section/SectionBuilder";
import { loadElement } from "./loadElement";
import { loadScrollTrigger } from "./loadScrollTrigger";

export function loadSection(options: {
  element: Element;
  presentationBuilder: PresentationBuilder;
}): void {
  const sectionBuilder = options.presentationBuilder.addSection();

  loadSectionProperties({ ...options, sectionBuilder });
  loadSectionChildren({ ...options, sectionBuilder });
}

function loadSectionProperties(options: {
  element: Element;
  sectionBuilder: SectionBuilder;
}): void {
  const { element, sectionBuilder } = options;

  const nameAttr = element.getAttribute("name");
  if (nameAttr && nameAttr.trim() !== "") {
    sectionBuilder.name = nameAttr;
  }

  const h = element.getAttribute("h");
  const b = element.getAttribute("b");

  // Set whichever is non-empty
  if (h && h.trim() !== "") {
    sectionBuilder.sectionHeight = h;
  }

  if (b && b.trim() !== "") {
    sectionBuilder.sectionBottom = b;
  }
}

function loadSectionChildren(options: {
  element: Element;
  sectionBuilder: SectionBuilder;
}): void {
  const { element, sectionBuilder } = options;

  Array.prototype.forEach.call(element.children, (child: Element) => {
    switch (child.tagName) {
      case "image":
      case "textbox":
        loadElement({ element: child, sectionBuilder });
        break;

      case "scroll-trigger": {
        const triggerBuilder = sectionBuilder.addScrollTrigger();
        loadScrollTrigger({ element: child, builder: triggerBuilder });
        break;
      }

      default:
        // Unknown child elements are ignored for now. Consider tightening this
        break;
    }
  });
}
