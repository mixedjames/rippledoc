import type { Element } from "@rippledoc/presentation4/viewAPI";

/**
 * Manages the editor's selected-object set.
 *
 * The editor view renders selection chrome; external tools are responsible for
 * mutating the set. All mutations emit "selection:changed" on EditorViewEvents.
 */
export interface EditorSelectionController {
  add(element: Element): void;
  remove(element: Element): void;
  /** Replace the entire selection with the supplied elements. */
  set(elements: Iterable<Element>): void;
  clear(): void;
  has(element: Element): boolean;
  readonly elements: ReadonlySet<Element>;
}
