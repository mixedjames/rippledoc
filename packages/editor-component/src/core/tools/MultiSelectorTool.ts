import type { EditorTool, EditorToolContext } from "./EditorTool";

/** Click to toggle individual elements in/out of the selection. */
export class MultiSelectorTool implements EditorTool {
  private unsubscribers_: Array<() => void> = [];

  activate(context: EditorToolContext): void {
    this.unsubscribers_.push(
      context.viewEvents.on("element:picked", ({ element }) => {
        if (context.selection.has(element)) {
          context.selection.remove(element);
        } else {
          context.selection.add(element);
        }
      }),
    );
  }

  deactivate(): void {
    for (const unsub of this.unsubscribers_) unsub();
    this.unsubscribers_ = [];
  }
}
