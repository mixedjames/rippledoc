import { marked } from "marked";
import { sanitizeHTML } from "@rippledoc/sanitizer";

/**
 * Parses the given markdown string and returns an HTMLElement representing the rendered markdown.
 */
export function parseMarkdown(markdown: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = sanitizeHTML(marked.parse(markdown) as string);

  return container;
}
