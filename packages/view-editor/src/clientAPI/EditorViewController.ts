import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { ViewMode } from "./ViewMode";
import type { EditorViewEventSource } from "./EditorViewEvents";
import type { EditorSelectionController } from "./EditorSelectionController";

/**
 * Public surface of the editor view controller.
 *
 * The controller is the stable, externally-visible object. The view that
 * backs it is ephemeral — it is created when the client calls
 * presentation.attachView(controller.viewFactory) and destroyed if the view
 * is swapped. Mode and selection survive attach/detach cycles because they
 * live on the controller, not the view.
 */
export interface EditorViewController {
  readonly viewFactory: p4.PresentationViewFactory;
  readonly events: EditorViewEventSource;
  readonly mode: ViewMode;
  setMode(mode: ViewMode): void;
  readonly selection: EditorSelectionController;
}
