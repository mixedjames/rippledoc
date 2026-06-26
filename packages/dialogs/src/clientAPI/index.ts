/**
 * clientAPI — the public interface set for dialogs.
 *
 * Everything here is a pure interface or type. Concrete implementations
 * are never exported; use createDialogs() as the sole construction point.
 */
export type { DialogResult } from "./DialogResult";
export type { OperationSink } from "./OperationSink";
export type { Dialogs } from "./Dialogs";
export type { AnchorPickTarget } from "./AnchorPickTarget";
