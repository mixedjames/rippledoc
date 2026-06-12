import type { XYAnchors } from "../anchors/XYAnchors";
import type { AnchorExpression } from "../anchors/Anchor";
import type {
  HorizontalAnchorSet,
  VerticalAnchorSet,
} from "../anchors/AnchorSet";
import { ConcreteXYAnchors } from "../anchors/ConcreteXYAnchors";
import { ConcreteAnchor } from "../anchors/ConcreteAnchor";
import { DerivedAnchorExpression } from "../anchors/expressions/DerivedAnchorExpression";
import { GeometryConstraintError } from "../anchors/GeometryConstraintError";

/**
 * Shared base for all concrete objects that own geometry anchors.
 *
 * Holds a ConcreteXYAnchors bag (the six anchor slots) and enforces the 2-of-3
 * rule when subclasses set axis constraints. Concrete subclasses expose the
 * appropriate setters publicly via their own interface obligations; this class
 * keeps the implementation private.
 */
export abstract class AnchoredObjectBase {
  private readonly anchors_: ConcreteXYAnchors;

  constructor() {
    this.anchors_ = new ConcreteXYAnchors();
  }

  get anchors(): XYAnchors {
    return this.anchors_;
  }

  // ── Axis constraint helpers ────────────────────────────────────────────────

  /**
   * Set the horizontal axis constraints. Exactly two of left/right/width must
   * be provided; the third is derived. See setAxis_ for the derivation rules.
   */
  protected setHorizontalAnchors_(descriptor: HorizontalAnchorSet): void {
    this.setAxis_(
      this.anchors_.left,
      this.anchors_.right,
      this.anchors_.width,
      descriptor.left,
      descriptor.right,
      descriptor.width,
      "horizontal",
    );
  }

  /**
   * Set the vertical axis constraints. Exactly two of top/bottom/height must
   * be provided; the third is derived. See setAxis_ for the derivation rules.
   */
  protected setVerticalAnchors_(descriptor: VerticalAnchorSet): void {
    this.setAxis_(
      this.anchors_.top,
      this.anchors_.bottom,
      this.anchors_.height,
      descriptor.top,
      descriptor.bottom,
      descriptor.height,
      "vertical",
    );
  }

  /**
   * Applies a 2-of-3 constraint update to one axis and commits it atomically.
   *
   * ── The 2-of-3 rule ───────────────────────────────────────────────────────
   *
   * On any axis, (start, end, size) are related by: end = start + size.
   * Specifying all three would over-constrain the axis (the system cannot
   * honour conflicting values). Specifying only one under-constrains it (we
   * cannot derive the others). Exactly two must be independently constrained;
   * the third is automatically derived from them.
   *
   * ── The derived expression ────────────────────────────────────────────────
   *
   * The three possible derivations are:
   *   start + end provided → size = end − start
   *   start + size provided → end  = start + size
   *   end + size provided  → start = end − size
   *
   * The derived expression closes over the two anchor OBJECTS (not their
   * current values). Because anchors have stable identity, this means the
   * derived value automatically stays consistent whenever the other two anchors
   * change — no re-derivation required.
   *
   * ── Atomicity ────────────────────────────────────────────────────────────
   *
   * All three expressions (two provided, one derived) are passed to
   * ConcreteAnchor.applyExpressions in a single call, which runs the cycle
   * check before touching any state. If the proposed graph contains a cycle
   * (e.g. left depends on right when right is being derived from left), a
   * GeometryConstraintError is thrown and nothing changes.
   */
  private setAxis_(
    startAnchor: ConcreteAnchor,
    endAnchor: ConcreteAnchor,
    sizeAnchor: ConcreteAnchor,
    startExpr: AnchorExpression | undefined,
    endExpr: AnchorExpression | undefined,
    sizeExpr: AnchorExpression | undefined,
    axis: "horizontal" | "vertical",
  ): void {
    const constraintCount = [startExpr, endExpr, sizeExpr].filter(
      (v) => v !== undefined,
    ).length;

    if (constraintCount !== 2) {
      throw new GeometryConstraintError(
        `${axis} axis requires exactly 2 constraints; ${constraintCount} were provided.`,
      );
    }

    let resolvedStart = startExpr;
    let resolvedEnd = endExpr;
    let resolvedSize = sizeExpr;

    if (startExpr !== undefined && endExpr !== undefined) {
      resolvedSize = new DerivedAnchorExpression(
        [startAnchor, endAnchor],
        () => endAnchor.value - startAnchor.value,
        `${axis}.size=end-start`,
      );
    } else if (startExpr !== undefined && sizeExpr !== undefined) {
      resolvedEnd = new DerivedAnchorExpression(
        [startAnchor, sizeAnchor],
        () => startAnchor.value + sizeAnchor.value,
        `${axis}.end=start+size`,
      );
    } else {
      resolvedStart = new DerivedAnchorExpression(
        [endAnchor, sizeAnchor],
        () => endAnchor.value - sizeAnchor.value,
        `${axis}.start=end-size`,
      );
    }

    ConcreteAnchor.applyExpressions(
      new Map([
        [startAnchor, resolvedStart!],
        [endAnchor, resolvedEnd!],
        [sizeAnchor, resolvedSize!],
      ]),
    );
  }
}
