import type {
  Anchor,
  Element,
  Section,
} from "@rippledoc/presentation4/viewAPI";

export type EditorViewEvents = {
  /** Fired on pointerdown over an element. Distinct from pointerDown so
   *  clients can treat a simple tap as a pick without also handling pointerDown. */
  "element:picked": { element: Element; source: PointerEvent };
  "element:pointerDown": { element: Element; source: PointerEvent };
  "element:pointerUp": { element: Element; source: PointerEvent };
  /** Fired on pointerdown over a section background (i.e. not over any element). */
  "section:picked": { section: Section; source: PointerEvent };
  "section:pointerDown": { section: Section; source: PointerEvent };
  "section:pointerUp": { section: Section; source: PointerEvent };
  /** Fired when the user clicks an anchor handle in "anchors" view mode. */
  "anchor:picked": { anchor: Anchor; source: PointerEvent };
  /** Keyboard events fired while the presentation viewport has focus. */
  "key:down": { source: KeyboardEvent };
  "key:up": { source: KeyboardEvent };
  /** Fired whenever the selection set changes. Always carries the full new sets. */
  "selection:changed": {
    elements: ReadonlySet<Element>;
    sections: ReadonlySet<Section>;
  };
};

/** The subscribe-only surface exposed to external clients via EditorViewController. */
export interface EditorViewEventSource {
  on<K extends keyof EditorViewEvents>(
    event: K,
    listener: (payload: EditorViewEvents[K]) => void,
  ): () => void;
}
