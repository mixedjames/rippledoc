import type { AnchorExpression } from "../../anchors/Anchor";
import type { AnchorExprMemento } from "../../clientAPI/serialize/PresentationMemento";
import type { AnchorRefResolver } from "./DeserializeContext";
import { constant, offsetFrom, fractionOf } from "../../anchors/factories";

export function resolveExpr(
  memento: AnchorExprMemento,
  resolve: AnchorRefResolver,
): AnchorExpression {
  switch (memento.type) {
    case "constant":
      return constant(memento.value);
    case "offset":
      return offsetFrom(resolve(memento.base), memento.offset);
    case "fraction":
      return fractionOf(resolve(memento.base), memento.fraction);
  }
}
