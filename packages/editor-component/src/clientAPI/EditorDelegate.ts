/**
 * The contract the shell must satisfy for the editor to request OS-level
 * operations: file access, text editing, and confirmation dialogs.
 *
 * Injected at construction time — makes every external dependency explicit
 * and easy to stub in tests.
 */
export interface EditorDelegate {
  /**
   * Open a file picker (or equivalent) and return an image source the editor
   * can embed. `src` must be a URL or data URI that the canvas can load as an
   * `<img>` element. Return `null` if the user cancels.
   */
  requestImageImport(): Promise<{ src: string } | null>;

  /**
   * Open a text-editing UI for a markdown element and return the edited string.
   * `current` is the element's existing markdown content; the shell can pre-
   * populate its dialog with it. Return `null` if the user cancels — the editor
   * will leave the element unchanged.
   */
  requestTextEdit(current: string): Promise<string | null>;

  /**
   * Show a confirmation prompt with `message` and return `true` if the user
   * confirms, `false` if they cancel. Used for destructive actions such as
   * deleting sections.
   */
  requestConfirm(message: string): Promise<boolean>;
}
