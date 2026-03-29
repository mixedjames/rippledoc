import { SectionBuilder } from "../section/SectionBuilder";
import { TextBoxBuilder } from "../element/textBoxElement/TextBoxElementBuilder";
import { parseMarkdown } from "@rippledoc/markdown";
import { applyCommonElementAttributes } from "./loadImageElement";
import { loadScrollTrigger } from "./loadScrollTrigger";
import { loadPin } from "./loadPin";
import { loadAnimation } from "./loadAnimation";

export function loadTextBoxElement(options: {
  element: Element;
  sectionBuilder: SectionBuilder;
}): void {
  const { element, sectionBuilder } = options;

  const builder: TextBoxBuilder = sectionBuilder.addTextBox();

  applyCommonElementAttributes({ element, builder });

  const markdown = (element.textContent ?? "").trim();

  const contentNode = parseMarkdown(markdown);
  builder.htmlContent = contentNode;

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
