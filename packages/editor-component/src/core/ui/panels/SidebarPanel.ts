import type { EditOperation } from "../../history/EditOperation";

export type PushOperation = (op: EditOperation) => void;

export interface SidebarPanel {
  readonly element: HTMLElement;
  /** Re-read state and redraw. */
  update(): void;
  dispose(): void;
}
