import type { ConcreteSection } from "../section/Section";
import { ConcreteMarkdownElement } from "./ConcreteMarkdownElement";

/**
 * Backward-compatible alias for the default markdown element implementation.
 */
export class ConcreteElement extends ConcreteMarkdownElement {
  constructor(section: ConcreteSection, markdown = "") {
    super(section, markdown);
  }
}
