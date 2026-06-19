export type ViewMode =
  | "player"
  | "editor"
  | "anchors"
  | "anchors-h"
  | "anchors-v"
  | "anchors-s";

/** True for any anchors sub-mode (plain or axis-specific). */
export function isAnchorsMode(mode: ViewMode): boolean {
  return mode !== "player" && mode !== "editor";
}
