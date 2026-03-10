import { ContentDependentDimension } from "@rippledoc/presentation";
import { ElementBuilder } from "../builder/ElementBuilder";
import { loadFill } from "./xmlStyleUtils";
import { loadScrollTrigger } from "./scrollTriggerFromXML";

export function loadElement(elementEl: Element, element: ElementBuilder): void {
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

  // Parse optional <fill> or <scroll-trigger> children.
  Array.from(elementEl.children).forEach((child) => {
    if (child.tagName === "fill") {
      loadFill(child, element);
      return;
    }

    if (child.tagName === "scroll-trigger") {
      // Only handle scroll triggers for builders that support them.
      const anyBuilder = element as unknown as {
        createScrollTrigger?: () => {
          setStart(expr: string): void;
          setEnd(expr: string): void;
          setStartViewOffset(offset: number): void;
          setEndViewOffset(offset: number): void;
        };
      };

      if (typeof anyBuilder.createScrollTrigger === "function") {
        loadScrollTrigger(child, {
          createScrollTrigger: anyBuilder.createScrollTrigger.bind(anyBuilder),
        });
      }
    }
  });
}
