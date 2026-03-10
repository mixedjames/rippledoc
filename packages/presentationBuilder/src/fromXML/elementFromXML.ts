import { ContentDependentDimension } from "@rippledoc/presentation";
import { ElementBuilder } from "../builder/ElementBuilder";
import { loadFill } from "./xmlStyleUtils";
import { loadScrollTrigger } from "./scrollTriggerFromXML";

// Entry point: configure an ElementBuilder from its XML representation.
// Delegates to helpers for clarity: one for attributes, one for children.
export function loadElement(elementEl: Element, element: ElementBuilder): void {
  loadElementAttributes(elementEl, element);
  loadElementChildren(elementEl, element);
}

// Load all layout/name attributes for the current element.
// Interprets "content" as a signal for content-dependent width/height.
function loadElementAttributes(
  elementEl: Element,
  element: ElementBuilder,
): void {
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
  const lAttr = l && l.trim();
  const rAttr = r && r.trim();
  const wAttr = w && w.trim();
  const tAttr = t && t.trim();
  const bAttr = bEl && bEl.trim();
  const hAttr = hEl && hEl.trim();

  if (lAttr) {
    element.setLeft(lAttr);
  }

  if (rAttr) {
    element.setRight(rAttr);
  }

  if (wAttr) {
    if (wAttr.toLowerCase() === "content") {
      element.setContentDependentDimension(ContentDependentDimension.Width);
    } else {
      element.setWidth(wAttr);
    }
  }

  if (tAttr) {
    element.setTop(tAttr);
  }

  if (bAttr) {
    element.setBottom(bAttr);
  }

  if (hAttr) {
    if (hAttr.toLowerCase() === "content") {
      element.setContentDependentDimension(ContentDependentDimension.Height);
    } else {
      element.setHeight(hAttr);
    }
  }
}

// Handle child nodes that extend the element, such as <fill> and <scroll-trigger>.
function loadElementChildren(
  elementEl: Element,
  element: ElementBuilder,
): void {
  Array.from(elementEl.children).forEach((child) => {
    if (child.tagName === "fill") {
      loadFill(child, element);
      return;
    }

    if (child.tagName === "scroll-trigger") {
      const trigger = element.createScrollTrigger();
      loadScrollTrigger(child, trigger);
    }
  });
}
