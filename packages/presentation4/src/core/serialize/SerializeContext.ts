import type { Layout } from "../../clientAPI/Layout";
import type { Anchor } from "../../anchors/Anchor";
import type { AnchorRef, AnchorSlot } from "../../clientAPI/serialize/PresentationMemento";
import type { ScrollTrigger } from "../../clientAPI/ScrollTrigger";

export type SerializeContext = {
  readonly layouts: readonly Layout[];
  /** anchorLookups[i] maps the Anchor objects for layouts[i] to their AnchorRefs. */
  readonly anchorLookups: ReadonlyArray<ReadonlyMap<Anchor, AnchorRef>>;
  readonly triggerIndex: ReadonlyMap<ScrollTrigger, number>;
};

export const ANCHOR_SLOTS: readonly AnchorSlot[] = [
  "left",
  "right",
  "width",
  "top",
  "bottom",
  "height",
];
