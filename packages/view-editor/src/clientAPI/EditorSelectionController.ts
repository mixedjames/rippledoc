import type { Element, Section } from "@rippledoc/presentation4/viewAPI";
import type { FocusState } from "./FocusState";

/**
 * Manages the editor's selected-object set and focused element.
 *
 * Only elements or sections may be selected at one time — never both. Any
 * write to one type clears the other. The view renders selection chrome;
 * external tools are responsible for mutating the set. All mutations emit
 * "selection:changed" on EditorViewEvents.
 *
 * The focused element is a single element that receives distinct chrome and
 * represents the current target for operations. It is independent of the
 * selection set — callers decide whether focus should follow selection or not.
 * Mutations emit "focus:changed" on EditorViewEvents.
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

  /**
   * Set the focused element. If the same element is already focused, no event
   * is fired. Fires "focus:changed" otherwise.
   */
  setFocusedElement(element: Element): void;
  /** Clear focused element. No-op (no event) if nothing is currently focused. */
  clearFocusedElement(): void;
  /**
   * Current focus state. Check `focus.focused` before accessing `focus.element`
   * — TypeScript narrows the type so the access is always compile-time safe.
   */
  readonly focus: FocusState;
}
