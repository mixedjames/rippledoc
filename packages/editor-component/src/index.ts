/**
 * editor-component — public package entry point.
 *
 * Exports the client-facing interface types and the factory function.
 * The concrete EditorComponentImpl is intentionally not exported.
 */
export type * from "./clientAPI/index";
export { createEditorComponent } from "./createEditorComponent";
