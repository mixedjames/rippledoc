import type { Element } from "@rippledoc/presentation4/viewAPI";

export type EditorViewEvents = {
  /** Fired on pointerdown over an element. Distinct from pointerDown so
   *  clients can treat a simple tap as a pick without also handling pointerDown. */
  "element:picked": { element: Element; source: PointerEvent };
  "element:pointerDown": { element: Element; source: PointerEvent };
  "element:pointerUp": { element: Element; source: PointerEvent };
  /** Keyboard events fired while the presentation viewport has focus. */
  "key:down": { source: KeyboardEvent };
  "key:up": { source: KeyboardEvent };
  /** Fired whenever the selection set changes. Always carries the full new set. */
  "selection:changed": { selection: ReadonlySet<Element> };
};

/** The subscribe-only surface exposed to external clients via EditorViewController. */
export interface EditorViewEventSource {
  on<K extends keyof EditorViewEvents>(
    event: K,
    listener: (payload: EditorViewEvents[K]) => void,
  ): () => void;
}
