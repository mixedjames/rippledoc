import { NullTool } from "@rippledoc/view-editor";
import type { EditorViewController } from "@rippledoc/view-editor";
import type { EditorTool, EditorToolContext } from "./EditorTool";

/** Click to select a single element or section; clicking empty space clears the selection. */
export class SingleSelectorTool implements EditorTool {
  private viewController_: EditorViewController | null = null;

  activate(context: EditorToolContext): void {
    this.viewController_ = context.state.viewController;
    this.viewController_.setActiveTool({
      onElementPicked: ({ element }) => {
        context.selection.setElements([element]);
      },
      onSectionPicked: ({ section }) => {
        context.selection.setSections([section]);
      },
    });
  }

  deactivate(): void {
    this.viewController_?.setActiveTool(NullTool);
    this.viewController_ = null;
  }
}
