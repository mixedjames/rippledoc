/**
 * Identifies an interactive tool. Tools handle pointer events on the canvas
 * while active; only one tool is active at a time.
 *
 * Activate via `exec("tool:<id>")`. The current tool is reported by the
 * `toolChanged` event.
 */
export type EditorToolId = "singleSelect" | "multiSelect";

/**
 * All commands the shell can send to the editor via `exec` / `canExec`.
 *
 * **History**
 * - `undo` / `redo` — step through the operation history.
 *
 * **Document structure**
 * - `addSection`     — append a new section to the presentation.
 * - `deleteSelected` — remove the currently selected elements and/or sections.
 *
 * **Content**
 * - `importImage` — triggers `delegate.requestImageImport()`; inserts the
 *                   returned image into the selection target.
 * - `editText`    — triggers `delegate.requestTextEdit(current)` for the
 *                   selected markdown element.
 *
 * **Tools** — `tool:<EditorToolId>`
 * - `tool:singleSelect` — select a single element or section at a time.
 * - `tool:multiSelect`  — add/remove items from the selection by clicking.
 */
export type EditorCommandId =
  | "undo"
  | "redo"
  | "addSection"
  | "deleteSelected"
  | "importImage"
  | "editText"
  | `tool:${EditorToolId}`;
