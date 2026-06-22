import type { Element, Section } from "@rippledoc/presentation4/viewAPI";
import type { FocusState } from "./FocusState";

export type EditorViewEvents = {
  /** Fired on pointerdown over an element. Semantic signal for selection —
   *  prefer this over pointerDown when the intent is "user picked this element".
   *  Both events fire on the same pointerdown; the distinction is naming intent,
   *  not timing or filtering. */
  "element:picked": { element: Element; source: PointerEvent };
  "element:pointerDown": { element: Element; source: PointerEvent };
  "element:pointerUp": { element: Element; source: PointerEvent };
  /** Fired on pointerdown over a section background (i.e. not over any element). */
  "section:picked": { section: Section; source: PointerEvent };
  "section:pointerDown": { section: Section; source: PointerEvent };
  "section:pointerUp": { section: Section; source: PointerEvent };
  /** Keyboard events fired while the presentation viewport has focus. */
  "key:down": { source: KeyboardEvent };
  "key:up": { source: KeyboardEvent };
  /** Fired whenever the selection set changes. Always carries the full new sets. */
  "selection:changed": {
    elements: ReadonlySet<Element>;
    sections: ReadonlySet<Section>;
  };
  /** Fired whenever the focused element changes. Carries the full new focus state. */
  "focus:changed": FocusState;
};

/** The subscribe-only surface exposed to external clients via EditorViewController. */
export interface EditorViewEventSource {
  on<K extends keyof EditorViewEvents>(
    event: K,
    listener: (payload: EditorViewEvents[K]) => void,
  ): () => void;
}
