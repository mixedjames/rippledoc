import type { Anchor } from "./Anchor";

/**
 * AnchorOwners are notified when an anchor's expression changes.
 *
 * Note: this is not the same as when the anchor's position changes, which is handled
 * by the layout system
 */
export interface AnchorOwner {
  anchorChanged(anchor: Anchor): void;
}
