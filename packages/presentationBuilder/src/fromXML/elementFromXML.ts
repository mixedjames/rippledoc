import type { Style } from "@rippledoc/presentation";
import { loadFill } from "./xmlStyleUtils";
import { loadScrollTrigger } from "./scrollTriggerFromXML";

export type ElementLikeBuilder = {
  setName(name: string): void;
  setLeft(expr: string): void;
  setRight(expr: string): void;
  setWidth(expr: string): void;
  setTop(expr: string): void;
  setBottom(expr: string): void;
  setHeight(expr: string): void;
  style: Style;
};

export function loadElement(
  elementEl: Element,
  element: ElementLikeBuilder,
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
