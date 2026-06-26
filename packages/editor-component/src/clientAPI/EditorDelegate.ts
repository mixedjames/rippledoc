import type {
  MarkdownElement,
  Presentation,
  PresentationRoot,
  Section,
  Element,
  ScrollTrigger,
} from "@rippledoc/presentation4";

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
   * Open a markdown editing dialog for `element`. The implementation is
   * responsible for applying the edit and registering it with undo/redo history
   * (typically via `dialogs.openMarkdownEditor`, which uses `OperationSink`).
   * Resolves when the dialog closes, regardless of whether the user saved or cancelled.
   */
  requestMarkdownEdit(element: MarkdownElement): Promise<void>;

  /**
   * Show a confirmation prompt with `message` and return `true` if the user
   * confirms, `false` if they cancel. Used for destructive actions such as
   * deleting sections.
   */
  requestConfirm(message: string): Promise<boolean>;

  /**
   * Open an anchor target picker showing the full presentation tree (root,
   * sections, elements, scroll triggers). Returns the picked object, or `null`
   * if the user cancels. Typically implemented by calling
   * `dialogs.openAnchorPicker` and unwrapping the result.
   */
  requestAnchorPick(
    presentation: Presentation,
  ): Promise<PresentationRoot | Section | Element | ScrollTrigger | null>;
}
