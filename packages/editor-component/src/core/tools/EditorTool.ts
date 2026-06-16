import type {
  EditorViewEventSource,
  EditorSelectionController,
} from "@rippledoc/view-editor";
import type { EditOperation } from "../history/EditOperation";
import type { EditorState } from "../EditorState";

export interface EditorToolContext {
  readonly viewEvents: EditorViewEventSource;
  readonly selection: EditorSelectionController;
  readonly state: EditorState;
  pushOperation(op: EditOperation): void;
}

export interface EditorTool {
  activate(context: EditorToolContext): void;
  deactivate(): void;
}
