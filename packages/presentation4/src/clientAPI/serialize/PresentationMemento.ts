/**
 * Types for the presentation memento (serialization format).
 *
 * A memento is a plain JSON-serializable snapshot of a presentation's public
 * state. It captures what was set by client code — not derived or internal
 * values — so it can be used to reconstruct an identical presentation.
 *
 * Cross-object anchor references are encoded as AnchorRefs: stable path
 * identifiers that locate a specific anchor slot within the tree by position.
 */

import type { KeyFrame } from "../animation/KeyFrame";

// ── Anchor addressing ─────────────────────────────────────────────────────────

/** The six named slots present on every anchored object's XYAnchors bag. */
export type AnchorSlot =
  | "left"
  | "right"
  | "width"
  | "top"
  | "bottom"
  | "height";

/**
 * The additional named anchors exposed directly on PresentationRoot (not part
 * of the XYAnchors bag). These are system-managed but can appear as bases in
 * client-authored anchor expressions.
 */
export type RootViewportSlot =
  | "viewportWidth"
  | "viewportHeight"
  | "viewportLeft"
  | "viewportRight";

/**
 * Identifies a specific anchor within the presentation tree.
 *
 * Integer indices match the live ordering of nodes:
 *   - section:    position in PresentationRoot.getSections()
 *   - element:    position in Section.getElements()
 *   - trigger:    position in the order triggers were added to Presentation
 *
 * AnchorRefs are implicitly scoped to the layout being described — never
 * cross-layout, matching the AnchoredObjectBase invariant.
 */
export type AnchorRef =
  | { readonly node: "root"; readonly slot: AnchorSlot | RootViewportSlot }
  | {
      readonly node: "section";
      readonly index: number;
      readonly slot: AnchorSlot;
    }
  | {
      readonly node: "element";
      readonly sectionIndex: number;
      readonly elementIndex: number;
      readonly slot: AnchorSlot;
    }
  | {
      readonly node: "trigger";
      readonly index: number;
      readonly slot: AnchorSlot;
    };

// ── Anchor expression mementos ────────────────────────────────────────────────

/** Mirrors ConstantAnchorExpression. */
export type ConstantExprMemento = {
  readonly type: "constant";
  readonly value: number;
};

/** Mirrors OffsetAnchorExpression: base.value + offset. */
export type OffsetExprMemento = {
  readonly type: "offset";
  readonly base: AnchorRef;
  readonly offset: number;
};

/** Mirrors FractionAnchorExpression: base.value * fraction. */
export type FractionExprMemento = {
  readonly type: "fraction";
  readonly base: AnchorRef;
  readonly fraction: number;
};

/**
 * Serialized form of an AnchorExpression.
 *
 * Only the three user-settable types appear here. DerivedAnchorExpression is
 * an internal constraint-system detail — it is reconstructed automatically
 * when the 2-of-3 geometry is reapplied during load.
 */
export type AnchorExprMemento =
  | ConstantExprMemento
  | OffsetExprMemento
  | FractionExprMemento;

// ── Geometry mementos ─────────────────────────────────────────────────────────

/**
 * Serialized form of a 2-of-3 horizontal axis constraint (mirrors HorizontalAnchorSet).
 * Exactly two of left/right/width will be present.
 */
export type HorizontalAnchorsMemento = {
  readonly left?: AnchorExprMemento;
  readonly right?: AnchorExprMemento;
  readonly width?: AnchorExprMemento;
};

/**
 * Serialized form of a 2-of-3 vertical axis constraint (mirrors VerticalAnchorSet).
 * Exactly two of top/bottom/height will be present.
 */
export type VerticalAnchorsMemento = {
  readonly top?: AnchorExprMemento;
  readonly bottom?: AnchorExprMemento;
  readonly height?: AnchorExprMemento;
};

/**
 * The single fixed edge for a content-height element.
 * Mirrors the { top } | { bottom } shape of Element.setAutoHeight().
 */
export type ContentHeightMemento =
  | { readonly fixedEdge: "top"; readonly expr: AnchorExprMemento }
  | { readonly fixedEdge: "bottom"; readonly expr: AnchorExprMemento };

/**
 * The single fixed edge for a content-width element.
 * Mirrors the { left } | { right } shape of Element.setAutoWidth().
 */
export type ContentWidthMemento =
  | { readonly fixedEdge: "left"; readonly expr: AnchorExprMemento }
  | { readonly fixedEdge: "right"; readonly expr: AnchorExprMemento };

/** Vertical geometry for one element in one layout. */
export type ElementVerticalGeometryMemento =
  | { readonly mode: "anchored"; readonly anchors: VerticalAnchorsMemento }
  | { readonly mode: "contentHeight"; readonly fixed: ContentHeightMemento };

/** Horizontal geometry for one element in one layout. */
export type ElementHorizontalGeometryMemento =
  | { readonly mode: "anchored"; readonly anchors: HorizontalAnchorsMemento }
  | { readonly mode: "contentWidth"; readonly fixed: ContentWidthMemento };

/** Full geometry for one element in one layout. */
export type ElementLayoutGeometryMemento = {
  readonly horizontal: ElementHorizontalGeometryMemento;
  readonly vertical: ElementVerticalGeometryMemento;
};

/** Geometry for one section in one layout (sections have no user-set horizontal geometry). */
export type SectionLayoutGeometryMemento = {
  readonly vertical: VerticalAnchorsMemento;
};

/** Geometry for one scroll trigger in one layout. */
export type TriggerLayoutGeometryMemento = {
  readonly vertical: VerticalAnchorsMemento;
};

// ── Animation mementos ────────────────────────────────────────────────────────

/**
 * Serialized form of a KeyFrameAnimation.
 *
 * KeyFrame is reused directly — it is already a plain value type with no
 * object references.
 *
 * target is a SubComponentTarget.selector string; omit for animations that
 * target the element itself rather than an SVG sub-component.
 */
export type KeyFrameAnimationMemento = {
  readonly triggerIndex: number;
  readonly keyFrames: readonly KeyFrame[];
  readonly duration: number;
  readonly isScrollDriven: boolean;
  readonly target?: string;
};

/** Serialized form of a Pin. */
export type PinMemento = {
  readonly triggerIndex: number;
};

// ── Node mementos ─────────────────────────────────────────────────────────────

/**
 * Serialized form of a ScrollTrigger.
 *
 * name is omitted when the trigger was created without one (empty string is
 * not stored — absence means "no name").
 */
export type ScrollTriggerMemento = {
  /** Per-layout geometry, parallel to PresentationMemento.layouts. */
  readonly layouts: readonly TriggerLayoutGeometryMemento[];
  readonly name?: string;
};

type BaseElementMemento = {
  /** Per-layout geometry, parallel to PresentationMemento.layouts. */
  readonly layouts: readonly ElementLayoutGeometryMemento[];
  readonly keyFrameAnimations: readonly KeyFrameAnimationMemento[];
  readonly pins: readonly PinMemento[];
};

export type MarkdownElementMemento = BaseElementMemento & {
  readonly type: "markdown";
  readonly markdown: string;
};

export type BitmapImageElementMemento = BaseElementMemento & {
  readonly type: "bitmap";
  readonly src: string;
  readonly alt: string;
};

export type SVGImageElementMemento = BaseElementMemento & {
  readonly type: "svg";
  readonly src: string;
};

export type ElementMemento =
  | MarkdownElementMemento
  | BitmapImageElementMemento
  | SVGImageElementMemento;

/**
 * Serialized form of a Section.
 *
 * Sections have no user-set horizontal geometry (they always span the full
 * presentation width), so only vertical geometry is stored per layout.
 */
export type SectionMemento = {
  /** Per-layout geometry, parallel to PresentationMemento.layouts. */
  readonly layouts: readonly SectionLayoutGeometryMemento[];
  readonly keyFrameAnimations: readonly KeyFrameAnimationMemento[];
  readonly elements: readonly ElementMemento[];
};

/** Serialized form of a Layout. */
export type LayoutMemento = {
  readonly basisWidth: number;
  readonly basisHeight: number;
};

/**
 * Top-level serialized form of a Presentation.
 *
 * Ordering invariants:
 *   - layouts[0]  is always the default layout
 *   - triggers, sections, and elements appear in their live tree order
 *   - All per-layout arrays on nodes are parallel to layouts[]
 *
 * LayoutPicker is not included — it is a user-supplied callback and cannot
 * be serialized. The caller is responsible for reattaching it after load.
 */
export type PresentationMemento = {
  readonly version: 1;
  readonly layouts: readonly LayoutMemento[];
  readonly triggers: readonly ScrollTriggerMemento[];
  readonly sections: readonly SectionMemento[];
};
