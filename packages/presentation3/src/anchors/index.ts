/**
 * Public API for the anchor system used by the presentation3 document model.
 *
 * Purpose:
 * - Defines stable anchor handles (`Anchor`) whose identity must remain fixed for the lifetime of the object.
 * - Defines replaceable anchor expressions used to compute the current value of each anchor.
 * - Provides expression factories for common composition patterns.
 * - Exposes shared anchor contracts used by document objects.
 *
 * Conceptual model:
 * - An anchor is the stable thing you hold on to and pass around.
 * - An expression is the mutable/replacable recipe currently attached to that anchor.
 * - Updating layout should usually replace an anchor's expression, not replace the anchor itself.
 *
 * Typical usage:
 * @example
 * ```ts
 * import * as Anchors from "@rippledoc/presentation3";
 *
 * const left = Anchors.constant(10);
 * const width = Anchors.constant(200);
 * // `right` can be derived by the owning model from `left` + `width`.
 * ```
 *
 * @example
 * ```ts
 * import * as Anchors from "@rippledoc/presentation3";
 *
 * // Build a relative expression from another anchor.
 * const afterPrevious = Anchors.offsetFrom(previous.bottomAnchor, 24);
 * ```
 *
 * @example
 * ```ts
 * import * as Anchors from "@rippledoc/presentation3";
 *
 * // Centering helpers return expressions that can be used in axis constraints.
 * const centered = Anchors.hCenter(container);
 * ```
 *
 * Error handling:
 * - Operations that violate geometry rules throw `GeometryConstraintError`.
 * - The most common failures are cyclic dependencies and invalid constraint combinations.
 * - A failed update should be treated as "the new expression was rejected" rather than "the anchor disappeared".
 * - Callers should treat these as validation failures and surface actionable feedback.
 *
 * Developers:
 * - Allowed dependencies:
 *   - Other modules under `anchors/`.
 *   - Type-only imports from shared contracts used by anchors.
 * - Not allowed dependencies:
 *   - `document/` modules (anchors must remain reusable and model-agnostic).
 *   - Rendering/view/UI packages.
 *   - App-level runtime concerns (I/O, networking, persistence).
 */
export { Anchor } from "./Anchor";
export type {
  XAnchoredObject,
  YAnchoredObject,
  XYAnchoredObject,
} from "./AnchoredObject";
export type { HorizontalAnchors, VerticalAnchors } from "./AnchorSets";
export type { AnchorOwner } from "./AnchorOwner";

export type {
  AnchorExpression,
  AnchorExpressionVisitor,
} from "./expressions/index";
export {
  ConstantAnchorExpression,
  OffsetAnchorExpression,
  FractionAnchorExpression,
  HorizontalCenterAnchorExpression,
  VerticalCenterAnchorExpression,
  DerivedAnchorExpression,
} from "./expressions/index";

export { GeometryConstraintError } from "./GeometryConstraintError";

export {
  constant,
  immutableConstant,
  offsetFrom,
  fractionOf,
  hCenter,
  vCenter,
} from "./factories";
