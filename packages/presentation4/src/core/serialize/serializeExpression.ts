import type { AnchorExpression, Anchor } from "../../anchors/Anchor";
import type {
  AnchorRef,
  AnchorExprMemento,
} from "../../clientAPI/serialize/PresentationMemento";
import { ConstantAnchorExpression } from "../../anchors/expressions/ConstantAnchorExpression";
import { OffsetAnchorExpression } from "../../anchors/expressions/OffsetAnchorExpression";
import { FractionAnchorExpression } from "../../anchors/expressions/FractionAnchorExpression";

export function serializeExpr(
  expr: AnchorExpression,
  lookup: ReadonlyMap<Anchor, AnchorRef>,
): AnchorExprMemento {
  if (expr instanceof ConstantAnchorExpression) {
    return { type: "constant", value: expr.value };
  }
  if (expr instanceof OffsetAnchorExpression) {
    return {
      type: "offset",
      base: requireRef(expr.base, lookup),
      offset: expr.offset,
    };
  }
  if (expr instanceof FractionAnchorExpression) {
    return {
      type: "fraction",
      base: requireRef(expr.base, lookup),
      fraction: expr.fraction,
    };
  }
  // DerivedAnchorExpression is an internal constraint-system detail and should
  // never reach this path — the geometry serializers skip derived anchors.
  throw new Error(
    `Cannot serialize expression type "${expr.constructor.name}". ` +
      `Only constant, offset, and fraction expressions are serializable.`,
  );
}

function requireRef(
  anchor: Anchor,
  lookup: ReadonlyMap<Anchor, AnchorRef>,
): AnchorRef {
  const ref = lookup.get(anchor);
  if (ref === undefined) {
    throw new Error(
      "Anchor not found in lookup table. The anchor may belong to a different presentation, " +
        "or the lookup was not built before serializing.",
    );
  }
  return ref;
}
