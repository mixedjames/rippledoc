import type { ViewablePresentation } from "@rippledoc/presentation4";
import type { EditorViewController } from "@rippledoc/view-editor";
import type { EditorToolId } from "../clientAPI/EditorCommands";

export class EditorState {
  activeToolId: EditorToolId = "singleSelect";
  isDirty = false;

  constructor(
    public presentation: ViewablePresentation,
    public viewController: EditorViewController,
  ) {}
}
