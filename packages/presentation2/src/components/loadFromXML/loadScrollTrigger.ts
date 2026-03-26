import { ScrollTriggerBuilder } from "../scrollTrigger/ScrollTriggerBuilder";

export function loadScrollTrigger(options: {
  element: Element;
  builder: ScrollTriggerBuilder;
}): void {
  const { element, builder } = options;

  const nameAttr = element.getAttribute("name");
  const startAttr = element.getAttribute("start");
  const endAttr = element.getAttribute("end");

  if (!nameAttr || nameAttr.trim() === "") {
    throw new Error("<scroll-trigger> must have a non-empty 'name' attribute");
  }

  if (!startAttr || startAttr.trim() === "") {
    throw new Error("<scroll-trigger> must have a non-empty 'start' attribute");
  }

  if (!endAttr || endAttr.trim() === "") {
    throw new Error("<scroll-trigger> must have a non-empty 'end' attribute");
  }

  builder.name = nameAttr.trim();
  builder.start = startAttr;
  builder.end = endAttr;
}
