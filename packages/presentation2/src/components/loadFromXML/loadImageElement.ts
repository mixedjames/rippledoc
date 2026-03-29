import { SectionBuilder } from "../section/SectionBuilder";
import { ImageElementBuilder } from "../element/imageElement/ImageElementBuilder";
import { ImageFit } from "../element/imageElement/ImageElement";
import { loadScrollTrigger } from "./loadScrollTrigger";
import { loadPin } from "./loadPin";
import { loadAnimation } from "./loadAnimation";

export function loadImageElement(options: {
  element: Element;
  sectionBuilder: SectionBuilder;
}): void {
  const { element, sectionBuilder } = options;

  const builder: ImageElementBuilder = sectionBuilder.addImageElement();

  applyCommonElementAttributes({ element, builder });

  const src = element.getAttribute("src");
  if (!src || src.trim() === "") {
    throw new Error("<image> must have a src attribute");
  }
  builder.source = src;

  const fitAttr = element.getAttribute("fit");
  if (fitAttr && fitAttr.trim() !== "") {
    const fit = fitAttr.trim().toLowerCase();
    switch (fit) {
      case "fill":
        builder.fit = ImageFit.Fill;
        break;
      case "contain":
        builder.fit = ImageFit.Contain;
        break;
      case "cover":
        builder.fit = ImageFit.Cover;
        break;
      default:
        throw new Error(
          `Invalid fit value '${fitAttr}' for <image>; expected 'fill', 'contain' or 'cover'`,
        );
    }
  }

  Array.prototype.forEach.call(element.children, (child: Element) => {
    const tag = child.tagName.toLowerCase();

    if (tag === "scroll-trigger") {
      const triggerBuilder = builder.addScrollTrigger();
      loadScrollTrigger({ element: child, builder: triggerBuilder });
      return;
    }

    if (tag === "pin") {
      const pinBuilder = builder.addPin();
      loadPin({ element: child, builder: pinBuilder });
      return;
    }

    if (tag === "animation") {
      const animationBuilder = builder.addAnimation();
      loadAnimation({ element: child, builder: animationBuilder });
      return;
    }
  });
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
