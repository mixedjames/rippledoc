/**
 * A reversible editing action. Follows the Command pattern.
 *
 * **Contract:**
 * - Operations capture all state needed for undo at construction time (snapshot the
 *   before-state before calling execute so it is available if undo is called later).
 * - `execute` is always called exactly once by `OperationHistory.push` — callers must
 *   NOT pre-execute an operation before handing it to `push`.
 * - `undo` reverses the effect and must be idempotent if called repeatedly (history
 *   will not call it twice in practice, but defensive snapshots are preferred).
 * - Neither method should throw; a failed operation leaves the document in an
 *   inconsistent state that cannot be recovered through the history stack.
 */
export interface EditOperation {
  execute(): void;
  undo(): void;
}
