/**
 * Controls what the editor view renders.
 *
 * - `"editor"` — full rendering with selection chrome (outlines, focus ring, trigger
 *   bands). Default mode.
 * - `"player"` — full rendering with all editor chrome hidden and animations enabled.
 *   Use for in-editor preview.
 */
export type ViewMode = "player" | "editor";
