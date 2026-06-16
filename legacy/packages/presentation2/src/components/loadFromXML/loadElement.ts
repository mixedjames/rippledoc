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

export type CommonElementBuilder = {
  name: string;
  readonly xAxis: {
    set(key: "left" | "width" | "right", expression: string): unknown;
  };
  readonly yAxis: {
    set(key: "top" | "height" | "bottom", expression: string): unknown;
  };
};

export function applyCommonElementAttributes(options: {
  element: Element;
  builder: CommonElementBuilder;
}): void {
  const { element, builder } = options;

  const nameAttr = element.getAttribute("name");
  if (nameAttr && nameAttr.trim() !== "") {
    builder.name = nameAttr;
  }

  const l = element.getAttribute("l");
  const w = element.getAttribute("w");
  const r = element.getAttribute("r");

  if (l && l.trim() !== "") {
    builder.xAxis.set("left", l);
  }
  if (w && w.trim() !== "") {
    builder.xAxis.set("width", w);
  }
  if (r && r.trim() !== "") {
    builder.xAxis.set("right", r);
  }

  const t = element.getAttribute("t");
  const h = element.getAttribute("h");
  const b = element.getAttribute("b");

  if (t && t.trim() !== "") {
    builder.yAxis.set("top", t);
  }
  if (h && h.trim() !== "") {
    builder.yAxis.set("height", h);
  }
  if (b && b.trim() !== "") {
    builder.yAxis.set("bottom", b);
  }
}
