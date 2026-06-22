import type { Element, Section } from "@rippledoc/presentation4";
import type { EditorToolId } from "./EditorCommands";

/**
 * All events the editor can fire at the shell, keyed by event name.
 *
 * Subscribe via `editor.events.on(name, listener)`.
 *
 * - **`toolChanged`** — the active tool switched (e.g. the user pressed a tool
 *   button, or the editor reset to the default tool after a deletion). Use this
 *   to keep the shell's tool-selector toolbar highlighted correctly.
 *
 * - **`selectionChanged`** — the selection changed (elements and/or sections).
 *   The full current selection is provided; the shell does not need to diff it.
 *   Use this to enable/disable context-sensitive commands like `deleteSelected`
 *   or `editText`, or to drive an inspector panel.
 *
 * - **`dirty`** — the document's unsaved-changes flag changed. `isDirty: true`
 *   means there are changes since the last `newPresentation` / `loadPresentation`
 *   call. Use this to update the title bar asterisk and enable the save button.
 *
 * - **`commandStateChanged`** — one or more commands may now be available or
 *   unavailable. Re-query `canExec` for every toolbar button. Fired after undo/
 *   redo, selection changes, tool switches, and document mutations.
 */
export type EditorEvents = {
  toolChanged: { tool: EditorToolId };
  selectionChanged: {
    elements: ReadonlySet<Element>;
    sections: ReadonlySet<Section>;
  };
  dirty: { isDirty: boolean };
  commandStateChanged: Record<never, never>;
};

/**
 * The event subscription interface exposed by `EditorComponent.events`.
 *
 * `on()` returns an unsubscribe function; call it to remove the listener when
 * the shell tears down (e.g. before replacing the editor or on page unload).
 *
 * The underlying emitter implementation (`TypedEmitter`) is internal and never
 * exported — this interface is the only surface shells should type against.
 */
export interface EditorEventSource {
  on<K extends keyof EditorEvents>(
    event: K,
    listener: (payload: EditorEvents[K]) => void,
  ): () => void;
}
