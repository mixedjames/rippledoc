import type { Anchor } from "./Anchor";
import { HorizontalAnchors, VerticalAnchors } from "./AnchorSets";

/**
 * An XAnchoredObject is an object that has a left, right, and width property, as well as
 * corresponding anchors for each property.
 */
export interface XAnchoredObject {
  get left(): number;
  get right(): number;
  get width(): number;

  get leftAnchor(): Anchor;
  get rightAnchor(): Anchor;
  get widthAnchor(): Anchor;

  setHorizontalAnchors(descriptor: HorizontalAnchors): void;
}

/**
 * A YAnchoredObject is an object that has a top, bottom, and height property, as well as
 * corresponding anchors for each property.
 */
export interface YAnchoredObject {
  get top(): number;
  get bottom(): number;
  get height(): number;

  get topAnchor(): Anchor;
  get bottomAnchor(): Anchor;
  get heightAnchor(): Anchor;

  setVerticalAnchors(descriptor: VerticalAnchors): void;
}

/**
 * An XYAnchoredObject is an object that has both X and Y anchors.
 */
export interface XYAnchoredObject extends XAnchoredObject, YAnchoredObject {}
