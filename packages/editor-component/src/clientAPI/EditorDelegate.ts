/**
 * The contract the shell must satisfy for the editor to request OS-level
 * operations: file access, text editing, and confirmation dialogs.
 *
 * Injected at construction time — makes every external dependency explicit
 * and easy to stub in tests.
 */
export interface EditorDelegate {
  requestImageImport(): Promise<{ src: string } | null>;
  requestTextEdit(current: string): Promise<string | null>;
  requestConfirm(message: string): Promise<boolean>;
}
