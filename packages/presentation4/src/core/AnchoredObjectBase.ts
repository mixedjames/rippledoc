import type { XYAnchors } from "../anchors/XYAnchors";
import type { AnchorExpression } from "../anchors/Anchor";
import type {
  HorizontalAnchorSet,
  VerticalAnchorSet,
} from "../anchors/AnchorSet";
import type { LayoutManager } from "../clientAPI/LayoutManager";
import type { Layout } from "../clientAPI/Layout";
import { ConcreteXYAnchors } from "../anchors/ConcreteXYAnchors";
import { ConcreteAnchor } from "../anchors/ConcreteAnchor";
import { ConstantAnchorExpression } from "../anchors/expressions/ConstantAnchorExpression";
import { DerivedAnchorExpression } from "../anchors/expressions/DerivedAnchorExpression";
import { GeometryConstraintError } from "../anchors/GeometryConstraintError";

// Which two of (start, end, size) were independently constrained on a setAxis_ call.
// "none" = setAxis_ was never called for this layout entry on this axis.
type AxisCombination = "start+size" | "start+end" | "end+size" | "none";

type LayoutEntry = {
  bag: ConcreteXYAnchors;
  hCombination: AxisCombination;
  vCombination: AxisCombination;
};

/**
 * Shared base for all concrete objects that own geometry anchors.
 *
 * Each layout owns an independent ConcreteXYAnchors bag stored in `entries_`.
 * `anchors` always returns the bag for the currently active layout.
 *
 * When a new layout is added, `initLayoutEntry_` copies the active layout's
 * constrained values as constants into the new bag. This gives a usable starting
 * point while keeping the two bags completely independent — no cross-layout
 * expression references can form.
 *
 * Concrete subclasses expose the appropriate set methods publicly via their own
 * interface obligations; this class keeps the shared implementation private.
 */
export abstract class AnchoredObjectBase {
  private readonly layoutContext_: LayoutManager;
  private readonly entries_: Map<Layout, LayoutEntry> = new Map();

  constructor(layoutContext: LayoutManager) {
    this.layoutContext_ = layoutContext;
    // Eagerly create the bag for whatever layout is active at construction time.
    this.entries_.set(layoutContext.activeLayout, this.newEntry_());
  }

  get anchors(): XYAnchors {
    return this.activeEntry_().bag;
  }

  get left(): number {
    return this.anchors.left.value;
  }
  get right(): number {
    return this.anchors.right.value;
  }
  get width(): number {
    return this.anchors.width.value;
  }
  get top(): number {
    return this.anchors.top.value;
  }
  get bottom(): number {
    return this.anchors.bottom.value;
  }
  get height(): number {
    return this.anchors.height.value;
  }

  // ── Layout lifecycle ──────────────────────────────────────────────────────

  /**
   * Called (via the Core* cascade) when a new layout is added to the presentation.
   *
   * Creates a fresh bag for `layout` by copying the currently-active layout's
   * constrained anchor values as constants. The two bags are completely independent:
   * the new layout's DerivedAnchorExpressions close over its own anchor objects,
   * not the source layout's, so there are no cross-layout dependencies.
   *
   * Axes that were never constrained (combination === "none") are left at zero
   * defaults rather than copying meaningless zeros.
   */
  protected initLayoutEntry_(layout: Layout): void {
    if (this.entries_.has(layout)) return; // guard against double-init
    const source = this.activeEntry_();
    const entry = this.newEntry_();

    this.copyAxisAsConstants_(
      source.bag.left,
      source.bag.right,
      source.bag.width,
      entry.bag.left,
      entry.bag.right,
      entry.bag.width,
      source.hCombination,
      "horizontal",
    );
    this.copyAxisAsConstants_(
      source.bag.top,
      source.bag.bottom,
      source.bag.height,
      entry.bag.top,
      entry.bag.bottom,
      entry.bag.height,
      source.vCombination,
      "vertical",
    );
    entry.hCombination = source.hCombination;
    entry.vCombination = source.vCombination;

    this.entries_.set(layout, entry);
    this.onBagCreated_(entry.bag);
  }

  /**
   * Called after a new layout bag is created and stored in initLayoutEntry_.
   * Override in subclasses to perform post-creation work such as registering
   * anchors in an ownership map. Not called for the initial bag (created in the
   * constructor) — subclasses handle that directly after super() completes.
   */
  protected onBagCreated_(bag: ConcreteXYAnchors): void {
    void bag; // no-op; subclasses override to register anchors in EventContext
  }

  // ── Axis constraint helpers ────────────────────────────────────────────────

  /**
   * Set the horizontal axis constraints for the active layout. Exactly two of
   * left/right/width must be provided; the third is derived. See setAxis_.
   */
  protected setHorizontalAnchors_(descriptor: HorizontalAnchorSet): void {
    const entry = this.activeEntry_();
    this.setAxis_(
      entry.bag.left,
      entry.bag.right,
      entry.bag.width,
      descriptor.left,
      descriptor.right,
      descriptor.width,
      "horizontal",
    );
    entry.hCombination = this.combination_(
      descriptor.left,
      descriptor.right,
      descriptor.width,
    );
  }

  /**
   * Set the vertical axis constraints for the active layout. Exactly two of
   * top/bottom/height must be provided; the third is derived. See setAxis_.
   */
  protected setVerticalAnchors_(descriptor: VerticalAnchorSet): void {
    const entry = this.activeEntry_();
    this.setAxis_(
      entry.bag.top,
      entry.bag.bottom,
      entry.bag.height,
      descriptor.top,
      descriptor.bottom,
      descriptor.height,
      "vertical",
    );
    entry.vCombination = this.combination_(
      descriptor.top,
      descriptor.bottom,
      descriptor.height,
    );
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private newEntry_(): LayoutEntry {
    return {
      bag: new ConcreteXYAnchors(),
      hCombination: "none",
      vCombination: "none",
    };
  }

  // ── Serialization helpers ─────────────────────────────────────────────────

  /** Returns the anchor bag for a specific layout, or undefined if it was never initialised. */
  protected getLayoutBag_(layout: Layout): ConcreteXYAnchors | undefined {
    return this.entries_.get(layout)?.bag;
  }

  /** True if setHorizontalAnchors_ (or setAutoWidth_) was ever called for this layout. */
  protected isHorizontalGeometrySet_(layout: Layout): boolean {
    return (this.entries_.get(layout)?.hCombination ?? "none") !== "none";
  }

  /** True if setVerticalAnchors_ (or setAutoHeight_) was ever called for this layout. */
  protected isVerticalGeometrySet_(layout: Layout): boolean {
    return (this.entries_.get(layout)?.vCombination ?? "none") !== "none";
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Returns the bag for the active layout. If the object was created before a
   * layout was added (and the cascade hasn't reached it yet), lazily creates a
   * fresh empty entry rather than throwing.
   */
  private activeEntry_(): LayoutEntry {
    const layout = this.layoutContext_.activeLayout;
    let entry = this.entries_.get(layout);
    if (!entry) {
      entry = this.newEntry_();
      this.entries_.set(layout, entry);
    }
    return entry;
  }

  /**
   * Determines which two anchors were explicitly constrained on a 2-of-3 axis call.
   * Precondition: exactly two of the three values are defined (validated by setAxis_).
   */
  private combination_(
    start: AnchorExpression | undefined,
    end: AnchorExpression | undefined,
    size: AnchorExpression | undefined,
  ): AxisCombination {
    if (start !== undefined && size !== undefined) return "start+size";
    if (start !== undefined && end !== undefined) return "start+end";
    return "end+size";
  }

  /**
   * Copies a constrained axis from a source bag into a destination bag using
   * constant expressions, eliminating all cross-layout anchor references.
   *
   * ── The copy strategy ─────────────────────────────────────────────────────
   *
   * The two independently constrained anchors (tracked by `combination`) are
   * copied as ConstantAnchorExpressions — a snapshot of their current value.
   * The third (derived) anchor gets a fresh DerivedAnchorExpression that closes
   * over the DESTINATION bag's own anchors, not the source bag's, so the
   * derivation relationship (e.g. "end = start + size") is preserved inside the
   * new layout's self-contained expression graph.
   *
   * "none" means the axis was never constrained; we skip it rather than copying
   * zeros, since zeros may never have been intentionally set.
   */
  private copyAxisAsConstants_(
    srcStart: ConcreteAnchor,
    srcEnd: ConcreteAnchor,
    srcSize: ConcreteAnchor,
    dstStart: ConcreteAnchor,
    dstEnd: ConcreteAnchor,
    dstSize: ConcreteAnchor,
    combination: AxisCombination,
    axis: "horizontal" | "vertical",
  ): void {
    if (combination === "none") return;

    const constStart = new ConstantAnchorExpression(srcStart.value);
    const constEnd = new ConstantAnchorExpression(srcEnd.value);
    const constSize = new ConstantAnchorExpression(srcSize.value);

    if (combination === "start+size") {
      // Constrained: start and size. Derived: end = start + size.
      ConcreteAnchor.applyExpressions(
        new Map<ConcreteAnchor, AnchorExpression>([
          [dstStart, constStart],
          [dstSize, constSize],
          [
            dstEnd,
            new DerivedAnchorExpression(
              [dstStart, dstSize],
              () => dstStart.value + dstSize.value,
              `${axis}.end=start+size`,
            ),
          ],
        ]),
      );
    } else if (combination === "start+end") {
      // Constrained: start and end. Derived: size = end - start.
      ConcreteAnchor.applyExpressions(
        new Map<ConcreteAnchor, AnchorExpression>([
          [dstStart, constStart],
          [dstEnd, constEnd],
          [
            dstSize,
            new DerivedAnchorExpression(
              [dstStart, dstEnd],
              () => dstEnd.value - dstStart.value,
              `${axis}.size=end-start`,
            ),
          ],
        ]),
      );
    } else {
      // "end+size": Constrained: end and size. Derived: start = end - size.
      ConcreteAnchor.applyExpressions(
        new Map<ConcreteAnchor, AnchorExpression>([
          [dstEnd, constEnd],
          [dstSize, constSize],
          [
            dstStart,
            new DerivedAnchorExpression(
              [dstEnd, dstSize],
              () => dstEnd.value - dstSize.value,
              `${axis}.start=end-size`,
            ),
          ],
        ]),
      );
    }
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
   * current values). Because anchors have stable identity, the derived value
   * automatically stays consistent whenever the other two anchors change —
   * no re-derivation required.
   *
   * ── Atomicity ────────────────────────────────────────────────────────────
   *
   * All three expressions (two provided, one derived) are passed to
   * ConcreteAnchor.applyExpressions in a single call, which runs the cycle
   * check before touching any state. If the proposed graph contains a cycle,
   * a GeometryConstraintError is thrown and nothing changes.
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
