import type {
  Presentation,
  PresentationOptions,
  PresentationMemento,
} from "@rippledoc/presentation4";
import type { EditorCommandId } from "./EditorCommands";
import type { EditorEventSource } from "./EditorEvents";

/**
 * The primary API surface the shell uses to drive the editor.
 *
 * Obtained via `createEditorComponent(delegate)` — never constructed directly.
 * All mutations go through `exec` / `newPresentation` / `loadPresentation`;
 * the editor's internal state is not directly accessible.
 *
 * **Lifecycle:**
 * 1. Call `newPresentation()` or `loadPresentation()` before the user can edit.
 *    Without this the canvas exists but has no document.
 * 2. Mount `element` into the shell's layout. Order doesn't matter; the canvas
 *    renders as soon as it is in the DOM and a presentation is loaded.
 * 3. Subscribe to `events` to keep the shell's toolbar state in sync.
 * 4. On save, call `getMemento()` and persist the result; on load, pass it back
 *    to `loadPresentation()`.
 */
export interface EditorComponent {
  /** The root DOM element to mount in the shell's layout. */
  readonly element: HTMLElement;

  /**
   * Replace the current presentation with a fresh empty one and return it for
   * seeding. The shell may add initial sections or content before relinquishing
   * control.
   */
  newPresentation(options?: PresentationOptions): Presentation;

  /**
   * Restore a presentation from a previously saved memento. Replaces the
   * current presentation and clears the undo/redo history.
   */
  loadPresentation(memento: PresentationMemento): void;

  /**
   * Serialize the current presentation to a JSON-safe memento suitable for
   * storage or transmission. Call this in the shell's save handler.
   */
  getMemento(): PresentationMemento;

  /**
   * Execute a named command. No-ops silently if `canExec` would return false,
   * so it is safe to call without a prior guard.
   */
  exec(command: EditorCommandId): void;

  /**
   * Query whether a command is currently executable. Re-query after every
   * `commandStateChanged` event to keep toolbar buttons accurate.
   */
  canExec(command: EditorCommandId): boolean;

  /** Subscribe to editor-to-shell events. See `EditorEvents` for the full list. */
  readonly events: EditorEventSource;
}
