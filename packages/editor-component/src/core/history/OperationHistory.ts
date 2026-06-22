import type { EditOperation } from "./EditOperation";

/**
 * Linear undo/redo history using two stacks.
 *
 * `push(op)` calls `op.execute()` immediately and pushes onto the undo stack.
 * Callers hand an un-executed operation to `push` — they never pre-execute it.
 *
 * Pushing a new operation clears the redo stack, giving a linear (not branching)
 * history. This matches user expectations: after undoing two steps and editing,
 * the undone future is discarded.
 */
export class OperationHistory {
  private readonly undoStack_: EditOperation[] = [];
  private readonly redoStack_: EditOperation[] = [];

  /** Execute an operation and push it onto the undo stack. Clears redo. */
  push(op: EditOperation): void {
    op.execute();
    this.undoStack_.push(op);
    this.redoStack_.length = 0;
  }

  undo(): void {
    const op = this.undoStack_.pop();
    if (op) {
      op.undo();
      this.redoStack_.push(op);
    }
  }

  redo(): void {
    const op = this.redoStack_.pop();
    if (op) {
      op.execute();
      this.undoStack_.push(op);
    }
  }

  canUndo(): boolean {
    return this.undoStack_.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack_.length > 0;
  }

  clear(): void {
    this.undoStack_.length = 0;
    this.redoStack_.length = 0;
  }
}
