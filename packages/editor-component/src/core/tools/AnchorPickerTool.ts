import { NullTool } from "@rippledoc/view-editor";
import type { EditorViewController } from "@rippledoc/view-editor";
import type { Element, Section } from "@rippledoc/presentation4";
import type { EditorTool, EditorToolContext } from "./EditorTool";

export type AnchorPickResult = Element | Section | null; // null = cancelled via Escape

/**
 * One-shot tool that waits for the user to click an element or section in the
 * canvas, then calls the callback and deactivates. Escape cancels (null result).
 *
 * Picked elements become the view-editor's focused element for visual chrome.
 * Self-pick is permitted — whether it is a valid anchor target depends on the
 * anchor slot being edited, which is validated in Stage 2 by the caller.
 */
export class AnchorPickerTool implements EditorTool {
  private viewController_: EditorViewController | null = null;
  private done_ = false;

  constructor(private readonly callback_: (result: AnchorPickResult) => void) {}

  activate(context: EditorToolContext): void {
    this.viewController_ = context.state.viewController;
    this.viewController_.setActiveTool({
      onElementPicked: ({ element }) => {
        context.selection.setFocusedElement(element);
        this.finish_(element);
      },
      onSectionPicked: ({ section }) => {
        // Sections have no focused-element chrome — just pass through.
        this.finish_(section);
      },
      onKeyDown: ({ source }) => {
        if (source.key === "Escape") this.finish_(null);
      },
    });
  }

  deactivate(): void {
    this.viewController_?.setActiveTool(NullTool);
    this.viewController_ = null;
  }

  private finish_(result: AnchorPickResult): void {
    if (this.done_) return;
    this.done_ = true;
    this.callback_(result);
  }
}
