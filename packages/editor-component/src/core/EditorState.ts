import type { ViewablePresentation } from "@rippledoc/presentation4";
import type { EditorViewController } from "@rippledoc/view-editor";
import type { EditorToolId } from "../clientAPI/EditorCommands";

export class EditorState {
  presentation: ViewablePresentation | null = null;
  viewController: EditorViewController | null = null;
  activeToolId: EditorToolId = "singleSelect";
  isDirty = false;
}
