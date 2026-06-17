import type { Element, Section } from "@rippledoc/presentation4/viewAPI";

/**
 * Manages the editor's selected-object set.
 *
 * Only elements or sections may be selected at one time — never both. Any
 * write to one type clears the other. The view renders selection chrome;
 * external tools are responsible for mutating the set. All mutations emit
 * "selection:changed" on EditorViewEvents.
 */
export interface EditorSelectionController {
  /** Add an element. Clears all sections if the section set was non-empty. */
  addElement(element: Element): void;
  removeElement(element: Element): void;
  /** Replace the entire element selection. Clears sections. */
  setElements(elements: Iterable<Element>): void;
  hasElement(element: Element): boolean;
  readonly elements: ReadonlySet<Element>;

  /** Add a section. Clears all elements if the element set was non-empty. */
  addSection(section: Section): void;
  removeSection(section: Section): void;
  /** Replace the entire section selection. Clears elements. */
  setSections(sections: Iterable<Section>): void;
  hasSection(section: Section): boolean;
  readonly sections: ReadonlySet<Section>;

  clear(): void;
}
