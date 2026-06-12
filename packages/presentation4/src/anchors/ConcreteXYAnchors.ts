import type { XYAnchors } from "./XYAnchors";
import { ConcreteAnchor } from "./ConcreteAnchor";

/**
 * A plain container of six ConcreteAnchor instances — one per geometry slot.
 *
 * This class has no opinion about how the anchors are constrained. The 2-of-3
 * rule and expression management live in AnchoredObjectBase, which holds a
 * ConcreteXYAnchors and accesses the ConcreteAnchor instances directly.
 *
 * The fields are typed as ConcreteAnchor (not just Anchor) so that
 * AnchoredObjectBase can pass them to ConcreteAnchor.applyExpressions without
 * casting. TypeScript accepts this as satisfying the XYAnchors interface
 * because ConcreteAnchor implements Anchor.
 */
export class ConcreteXYAnchors implements XYAnchors {
  readonly left = new ConcreteAnchor();
  readonly right = new ConcreteAnchor();
  readonly width = new ConcreteAnchor();
  readonly top = new ConcreteAnchor();
  readonly bottom = new ConcreteAnchor();
  readonly height = new ConcreteAnchor();
}
