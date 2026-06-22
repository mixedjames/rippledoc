import type { ViewablePresentation } from "@rippledoc/presentation4";
import type { EditorViewController } from "@rippledoc/view-editor";
import type { EditorToolId } from "../clientAPI/EditorCommands";

/**
 * Mutable shared context passed by reference to tools and sidebar panels.
 *
 * The bag pattern means that when `EditorComponentImpl.newPresentation()` replaces
 * `presentation` and `viewController`, every subsystem that holds a reference to
 * `state_` automatically sees the updated values without needing to be re-wired.
 * The alternative — passing each value separately and re-injecting on replace — would
 * require EditorComponentImpl to know the internal structure of every consumer.
 */
export class EditorState {
  activeToolId: EditorToolId = "singleSelect";
  isDirty = false;

  constructor(
    public presentation: ViewablePresentation,
    public viewController: EditorViewController,
  ) {}
}
