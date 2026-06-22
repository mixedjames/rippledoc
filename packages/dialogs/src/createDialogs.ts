import type { Dialogs } from "./clientAPI/Dialogs";
import type { OperationSink } from "./clientAPI/OperationSink";
import { DialogsImpl } from "./core/DialogsImpl";

export function createDialogs(mountPoint: HTMLElement, sink: OperationSink): Dialogs {
  return new DialogsImpl(mountPoint, sink);
}
