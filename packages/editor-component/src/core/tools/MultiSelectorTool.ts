import type { EditorTool, EditorToolContext } from "./EditorTool";

/** Click to toggle individual elements or sections in/out of the selection. */
export class MultiSelectorTool implements EditorTool {
  private unsubscribers_: Array<() => void> = [];

  activate(context: EditorToolContext): void {
    this.unsubscribers_.push(
      context.viewEvents.on("element:picked", ({ element }) => {
        if (context.selection.hasElement(element)) {
          context.selection.removeElement(element);
        } else {
          context.selection.addElement(element);
        }
      }),
      context.viewEvents.on("section:picked", ({ section }) => {
        if (context.selection.hasSection(section)) {
          context.selection.removeSection(section);
        } else {
          context.selection.addSection(section);
        }
      }),
    );
  }

  deactivate(): void {
    for (const unsub of this.unsubscribers_) unsub();
    this.unsubscribers_ = [];
  }
}
