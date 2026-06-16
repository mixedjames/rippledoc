import type { EditorTool, EditorToolContext } from "./EditorTool";

/** Click to select a single element; clicking empty space clears the selection. */
export class SingleSelectorTool implements EditorTool {
  private unsubscribers_: Array<() => void> = [];

  activate(context: EditorToolContext): void {
    this.unsubscribers_.push(
      context.viewEvents.on("element:picked", ({ element }) => {
        context.selection.set([element]);
      }),
    );
  }

  deactivate(): void {
    for (const unsub of this.unsubscribers_) unsub();
    this.unsubscribers_ = [];
  }
}
