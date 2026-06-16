/**
 * clientAPI — the public interface set for editor-component.
 *
 * Everything here is a pure interface or type. The concrete EditorComponentImpl
 * is never exported; use createEditorComponent() as the sole construction point.
 */
export type { EditorComponent } from "./EditorComponent";
export type { EditorCommandId, EditorToolId } from "./EditorCommands";
export type { EditorDelegate } from "./EditorDelegate";
export type { EditorEvents, EditorEventSource } from "./EditorEvents";
