import type { ElementView } from "../../viewAPI/ElementView";

/**
 * A no-op ElementView used before a real view is attached.
 */
export class NullElementView implements ElementView {
  layout(): void {}

  destroy(): void {}
}
