import { SectionBuilder } from "../section/SectionBuilder";
import { ImageElementBuilder } from "../element/imageElement/ImageElementBuilder";
import { ImageFit } from "../element/imageElement/ImageElement";
import { applyCommonElementAttributes } from "./loadElement";
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
