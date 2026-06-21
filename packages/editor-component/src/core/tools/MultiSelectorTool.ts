import { NullTool } from "@rippledoc/view-editor";
import type { EditorViewController } from "@rippledoc/view-editor";
import type { EditorTool, EditorToolContext } from "./EditorTool";

/** Click to toggle individual elements or sections in/out of the selection. */
export class MultiSelectorTool implements EditorTool {
  private viewController_: EditorViewController | null = null;

  activate(context: EditorToolContext): void {
    this.viewController_ = context.state.viewController;
    this.viewController_.setActiveTool({
      onElementPicked: ({ element }) => {
        if (context.selection.hasElement(element)) {
          context.selection.removeElement(element);
        } else {
          context.selection.addElement(element);
        }
      },
      onSectionPicked: ({ section }) => {
        if (context.selection.hasSection(section)) {
          context.selection.removeSection(section);
        } else {
          context.selection.addSection(section);
        }
      },
    });
  }

  deactivate(): void {
    this.viewController_?.setActiveTool(NullTool);
    this.viewController_ = null;
  }
}
