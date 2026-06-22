/**
 * @rippledoc/editor-component — portable, framework-agnostic presentation editor UI.
 *
 * ## Purpose
 * This package is the integration layer between a host **shell** (Electron desktop
 * app, browser web app, etc.) and the RippleDoc domain model. It wraps:
 *   - `@rippledoc/presentation4` — document data model and domain logic
 *   - `@rippledoc/view-editor`   — interactive canvas rendering
 *
 * The shell gets a single `EditorComponent` instance and talks to it through a
 * small, stable imperative API. Everything inside this package (DOM construction,
 * tool management, undo/redo stacks) is an implementation detail.
 *
 * ## Shell responsibilities
 * - Provide an `EditorDelegate` for OS-level operations (file pickers, text
 *   editing dialogs, confirm prompts). These are injected rather than built-in
 *   so they can be swapped between Electron and browser environments.
 * - Mount `editor.element` into its own layout.
 * - Own global controls — new / save / load / undo / redo toolbar. Execute them
 *   via `editor.exec()` and keep them enabled/disabled via `editor.canExec()`.
 * - Re-query `canExec` whenever the editor fires `commandStateChanged`.
 *
 * ## Example usage
 * ```ts
 * import { createEditorComponent } from "@rippledoc/editor-component";
 * import type { EditorDelegate } from "@rippledoc/editor-component";
 *
 * const delegate: EditorDelegate = {
 *   requestImageImport: () => showFilePicker(),
 *   requestTextEdit:    (current) => showTextDialog(current),
 *   requestConfirm:     (message) => confirm(message),
 * };
 *
 * const editor = createEditorComponent(delegate);
 *
 * // Mount into the shell's DOM
 * document.getElementById("editor-host")!.appendChild(editor.element);
 *
 * // Seed a blank document
 * const presentation = editor.newPresentation();
 *
 * // Keep toolbar buttons in sync
 * editor.events.on("commandStateChanged", () => {
 *   undoBtn.disabled = !editor.canExec("undo");
 *   redoBtn.disabled = !editor.canExec("redo");
 * });
 *
 * editor.events.on("dirty", ({ isDirty }) => {
 *   titleBar.setUnsaved(isDirty);
 * });
 *
 * undoBtn.addEventListener("click", () => editor.exec("undo"));
 * redoBtn.addEventListener("click", () => editor.exec("redo"));
 * saveBtn.addEventListener("click", () => save(editor.getMemento()));
 * ```
 */
export type * from "./clientAPI/index";
export { createEditorComponent } from "./createEditorComponent";
