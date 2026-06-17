import type { EditorTool, EditorToolContext } from "./EditorTool";

/** Click to select a single element or section; clicking empty space clears the selection. */
export class SingleSelectorTool implements EditorTool {
  private unsubscribers_: Array<() => void> = [];

  activate(context: EditorToolContext): void {
    this.unsubscribers_.push(
      context.viewEvents.on("element:picked", ({ element }) => {
        context.selection.setElements([element]);
      }),
      context.viewEvents.on("section:picked", ({ section }) => {
        context.selection.setSections([section]);
      }),
    );
  }

  deactivate(): void {
    for (const unsub of this.unsubscribers_) unsub();
    this.unsubscribers_ = [];
  }
}
