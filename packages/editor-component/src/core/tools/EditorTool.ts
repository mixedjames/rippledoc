import type {
  EditorViewEventSource,
  EditorSelectionController,
} from "@rippledoc/view-editor";
import type { EditOperation } from "../history/EditOperation";
import type { EditorState } from "../EditorState";

/**
 * Narrow capability set given to a tool when it becomes active. Tools receive
 * exactly what they need and hold no direct reference to `EditorComponentImpl`.
 *
 * - `viewEvents` / `selection` — the canvas event bus and selection controller
 *   from `view-editor`; tools subscribe in `activate` and unsubscribe in `deactivate`.
 * - `state` — the shared mutable bag; tools read `state.viewController` and
 *   `state.presentation` but should treat `state.isDirty` as write-only via `pushOperation`.
 * - `pushOperation` — the tool's only write path. Executes the operation and
 *   routes it through history → dirty flag → commandStateChanged event.
 */
export interface EditorToolContext {
  readonly viewEvents: EditorViewEventSource;
  readonly selection: EditorSelectionController;
  readonly state: EditorState;
  pushOperation(op: EditOperation): void;
}

/**
 * An active-tool abstraction: one tool is live at a time and owns the canvas
 * pointer interaction for its duration.
 *
 * `activate(context)` and `deactivate()` are symmetric: subscribe in `activate`,
 * unsubscribe in `deactivate`. `deactivate` must be safe to call even if
 * `activate` was never called (NULL_TOOL in EditorComponentImpl relies on this).
 *
 * To add a new tool: implement this interface, construct it in
 * `EditorComponentImpl.createTool_`, and wire a command id in `EditorCommands.ts`.
 */
export interface EditorTool {
  activate(context: EditorToolContext): void;
  deactivate(): void;
}
