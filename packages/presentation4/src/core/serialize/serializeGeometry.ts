import type { Anchor, AnchorExpression } from "../../anchors/Anchor";
import type { ConcreteXYAnchors } from "../../anchors/ConcreteXYAnchors";
import type { ContentDependentDimension } from "../../clientAPI/Element";
import type {
  AnchorRef,
  HorizontalAnchorsMemento,
  VerticalAnchorsMemento,
  ElementHorizontalGeometryMemento,
  ElementVerticalGeometryMemento,
  ElementLayoutGeometryMemento,
  SectionLayoutGeometryMemento,
  TriggerLayoutGeometryMemento,
} from "../../clientAPI/serialize/PresentationMemento";
import { DerivedAnchorExpression } from "../../anchors/expressions/DerivedAnchorExpression";
import { serializeExpr } from "./serializeExpression";

type Lookup = ReadonlyMap<Anchor, AnchorRef>;

export function serializeSectionLayoutGeometry(
  bag: ConcreteXYAnchors,
  vIsSet: boolean,
  lookup: Lookup,
): SectionLayoutGeometryMemento {
  return { vertical: vIsSet ? serializeVerticalAnchors(bag, lookup) : {} };
}

export function serializeTriggerLayoutGeometry(
  bag: ConcreteXYAnchors,
  lookup: Lookup,
): TriggerLayoutGeometryMemento {
  // Vertical geometry is always set on triggers (done in CoreScrollTrigger constructor).
  return { vertical: serializeVerticalAnchors(bag, lookup) };
}

export function serializeElementLayoutGeometry(
  bag: ConcreteXYAnchors,
  hIsSet: boolean,
  vIsSet: boolean,
  contentDependentDimension: ContentDependentDimension,
  lookup: Lookup,
): ElementLayoutGeometryMemento {
  return {
    horizontal: serializeElementHorizontal(bag, hIsSet, contentDependentDimension, lookup),
    vertical: serializeElementVertical(bag, vIsSet, contentDependentDimension, lookup),
  };
}

function serializeElementHorizontal(
  bag: ConcreteXYAnchors,
  hIsSet: boolean,
  mode: ContentDependentDimension,
  lookup: Lookup,
): ElementHorizontalGeometryMemento {
  if (mode === "width") {
    // The user set exactly one of left/right; the other is derived. Width is measured.
    if (!isDerived(bag.left.expression)) {
      return {
        mode: "contentWidth",
        fixed: { fixedEdge: "left", expr: serializeExpr(bag.left.expression, lookup) },
      };
    }
    return {
      mode: "contentWidth",
      fixed: { fixedEdge: "right", expr: serializeExpr(bag.right.expression, lookup) },
    };
  }
  return { mode: "anchored", anchors: hIsSet ? serializeHorizontalAnchors(bag, lookup) : {} };
}

function serializeElementVertical(
  bag: ConcreteXYAnchors,
  vIsSet: boolean,
  mode: ContentDependentDimension,
  lookup: Lookup,
): ElementVerticalGeometryMemento {
  if (mode === "height") {
    // The user set exactly one of top/bottom; the other is derived. Height is measured.
    if (!isDerived(bag.top.expression)) {
      return {
        mode: "contentHeight",
        fixed: { fixedEdge: "top", expr: serializeExpr(bag.top.expression, lookup) },
      };
    }
    return {
      mode: "contentHeight",
      fixed: { fixedEdge: "bottom", expr: serializeExpr(bag.bottom.expression, lookup) },
    };
  }
  return { mode: "anchored", anchors: vIsSet ? serializeVerticalAnchors(bag, lookup) : {} };
}

function serializeVerticalAnchors(bag: ConcreteXYAnchors, lookup: Lookup): VerticalAnchorsMemento {
  return {
    top: isUserSet(bag.top.expression) ? serializeExpr(bag.top.expression, lookup) : undefined,
    bottom: isUserSet(bag.bottom.expression)
      ? serializeExpr(bag.bottom.expression, lookup)
      : undefined,
    height: isUserSet(bag.height.expression)
      ? serializeExpr(bag.height.expression, lookup)
      : undefined,
  };
}

function serializeHorizontalAnchors(
  bag: ConcreteXYAnchors,
  lookup: Lookup,
): HorizontalAnchorsMemento {
  return {
    left: isUserSet(bag.left.expression) ? serializeExpr(bag.left.expression, lookup) : undefined,
    right: isUserSet(bag.right.expression)
      ? serializeExpr(bag.right.expression, lookup)
      : undefined,
    width: isUserSet(bag.width.expression)
      ? serializeExpr(bag.width.expression, lookup)
      : undefined,
  };
}

// DerivedAnchorExpression is the only non-user-authored expression type.
// Constants, offsets, and fractions are all user-authored.
function isDerived(expr: AnchorExpression): boolean {
  return expr instanceof DerivedAnchorExpression;
}

function isUserSet(expr: AnchorExpression): boolean {
  return !isDerived(expr);
}
