import type { Element } from "../Element";

/**
 * A MarkdownElement displays formatted text content rendered from Markdown source.
 */
export interface MarkdownElement extends Element {
  /** The current Markdown source text. */
  get markdown(): string;

  /** Replaces the Markdown content. */
  setMarkdown(markdown: string): void;
}
