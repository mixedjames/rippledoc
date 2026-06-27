import type { Anchor } from "../../anchors/Anchor";
import type { AnchorRef } from "../../clientAPI/serialize/PresentationMemento";

/**
 * Resolves an AnchorRef to the live Anchor for the currently active layout.
 *
 * The resolver is rebuilt each time the active layout changes during the
 * geometry pass — switching layouts makes each object's .anchors getter
 * return that layout's bag, so the closure implicitly captures the right set.
 */
export type AnchorRefResolver = (ref: AnchorRef) => Anchor;
