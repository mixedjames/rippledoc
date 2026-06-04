import type { Anchor } from "./Anchor";

export interface AnchoredObject {
  get left(): number;
  get right(): number;
  get width(): number;

  get top(): number;
  get bottom(): number;
  get height(): number;

  get leftAnchor(): Anchor;
  get rightAnchor(): Anchor;
  get widthAnchor(): Anchor;

  get topAnchor(): Anchor;
  get bottomAnchor(): Anchor;
  get heightAnchor(): Anchor;
}
