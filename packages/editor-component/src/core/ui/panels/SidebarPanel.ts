import type { EditOperation } from "../../history/EditOperation";

/** Convenience alias for the operation push callback panels receive from `Sidebar`. */
export type PushOperation = (op: EditOperation) => void;

/**
 * Contract all sidebar panels must satisfy.
 *
 * `update()` is called by `Sidebar` whenever the selection changes. Panels should
 * fully re-read from `EditorState` and re-render; they must not cache selection state
 * between calls. `dispose()` is called when the sidebar is torn down; panels should
 * release any non-DOM resources (timers, external subscriptions) acquired in their
 * constructor. The DOM element is discarded by the caller after `dispose`.
 */
export interface SidebarPanel {
  readonly element: HTMLElement;
  update(): void;
  dispose(): void;
}
