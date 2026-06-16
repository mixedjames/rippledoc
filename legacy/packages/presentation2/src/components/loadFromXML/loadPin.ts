import { PinBuilder } from "../animation/pin/PinBuilder";

export function loadPin(options: {
  element: Element;
  builder: PinBuilder;
}): void {
  const { element, builder } = options;

  const triggerAttr = element.getAttribute("trigger");
  if (!triggerAttr || triggerAttr.trim() === "") {
    throw new Error("<pin> must have a non-empty 'trigger' attribute");
  }

  builder.scrollTrigger = triggerAttr.trim();
}
