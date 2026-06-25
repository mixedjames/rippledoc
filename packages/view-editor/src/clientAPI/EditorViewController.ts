import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { ViewMode } from "./ViewMode";
import type { EditorViewEventSource } from "./EditorViewEvents";
import type { EditorSelectionController } from "./EditorSelectionController";
import type { EditorTool } from "./EditorTool";

/**
 * Public surface of the editor view controller.
 *
 * The controller is the stable, externally-visible object. The view that
 * backs it is ephemeral — it is created when the client calls
 * presentation.attachView(controller.viewFactory) and destroyed if the view
 * is swapped. Mode, selection, and the active tool survive attach/detach
 * cycles because they live on the controller, not the view.
 */
export interface EditorViewController {
  /** Pass to `presentation.attachView()` to mount the editor view. */
  readonly viewFactory: p4.PresentationViewFactory;
  /** Subscribe to pointer, keyboard, selection, and focus events. */
  readonly events: EditorViewEventSource;
  /** Current view mode. Defaults to `"editor"`. */
  readonly mode: ViewMode;
  /** Switch between `"editor"` and `"player"` modes. */
  setMode(mode: ViewMode): void;
  /** Manage the selected elements, sections, and triggers, and the focused element. */
  readonly selection: EditorSelectionController;
  /** Replace the active tool. Pass `NullTool` to deactivate without nulls. */
  setActiveTool(tool: EditorTool): void;
  /** The currently active tool. `NullTool` when no tool is installed. */
  readonly activeTool: EditorTool;
}
