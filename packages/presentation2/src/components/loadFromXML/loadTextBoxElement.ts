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

  const markdown = stripCommonIndent(element.textContent ?? "").trim();

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

/**
 * Strips the common leading indentation from all lines in the given text.
 *
 * This is needed because we embed Markdown content in XML. For readability, XML often features
 * indentation that we don't want to be part of the Markdown content.
 *
 * Unfortunately, Markdown treats leading spaces as significant (e.g. for code blocks), so we can't
 * just ignore this.
 *
 * An alternative strategy would be to let the first line determine the common indent, and then
 * strip that from all lines.
 */
function stripCommonIndent(text: string): string {
  // replace tabs with spaces and split into lines
  const lines = text.replace(/\t/g, "    ").split("\n");

  // ignore empty lines
  // Note: '!' is ok because the regex matches any number of spaces (including zero), so it will
  // always return a match.
  const indents = lines
    .filter((line) => line.trim().length) // ignore empty lines
    .map((line) => line.match(/^ */)![0].length); // get the length of leading spaces

  if (indents.length === 0) {
    // no non-empty lines, return original text - note this is for correctness, not efficiency,
    // since otherwise we will be passing an empty array to Math.min
    return text;
  }

  const minIndent = Math.min(...indents);
  if (minIndent === 0) {
    // no common indent, return original text
    return text;
  }

  return lines.map((line) => line.slice(minIndent)).join("\n");
}
