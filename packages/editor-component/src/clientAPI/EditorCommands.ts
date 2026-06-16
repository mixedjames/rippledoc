export type EditorToolId = "singleSelect" | "multiSelect";

export type EditorCommandId =
  | "undo"
  | "redo"
  | "addSection"
  | "deleteSelected"
  | "importImage"
  | "editText"
  | `tool:${EditorToolId}`;
