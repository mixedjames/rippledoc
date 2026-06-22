/**
 * Receives undoable operations from dialogs and records them in the editor's
 * undo/redo history. The parent app provides an implementation that bridges to
 * editor-component. Dialogs call execute() themselves before pushing.
 */
export interface OperationSink {
  push(operation: { execute(): void; undo(): void }): void;
}
