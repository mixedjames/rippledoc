import type { EditorState } from "../../EditorState";
import type { AnchorPickResult } from "../../tools/AnchorPickerTool";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";
import type {
  Element,
  Section,
  ScrollTrigger,
  Anchor,
  AnchorExpression,
  HorizontalAnchorSet,
  Presentation,
  VerticalAnchorSet,
} from "@rippledoc/presentation4";
import {
  ConstantAnchorExpression,
  OffsetAnchorExpression,
  FractionAnchorExpression,
} from "@rippledoc/presentation4";
import type { EditOperation } from "../../history/EditOperation";

// ── Types ─────────────────────────────────────────────────────────────────────

type HSlot = "left" | "right" | "width";
type VSlot = "top" | "bottom" | "height";
type AnchorSlot = HSlot | VSlot;

type AnchorEntry = {
  name: AnchorSlot;
  anchor: Anchor;
  axis: "horizontal" | "vertical";
  locked?: boolean;
  lockNote?: string;
  // True when this size anchor is content-measured for its element. The anchor
  // carries a DerivedAnchorExpression, but unlike arithmetic-derived anchors
  // it is user-configurable (the user can exit fit-content mode via the type dropdown).
  fitContent?: boolean;
};

type DetailState = {
  subject: Element | Section | ScrollTrigger;
  entry: AnchorEntry;
};

// The user-selectable expression types. "derived" is excluded — it is always
// the third implied anchor. "fitContent" is only offered for size anchors on
// elements that support content-dependent layout.
type ExprType = "constant" | "offset" | "fraction" | "fitContent";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isElement(
  subject: Element | Section | ScrollTrigger,
): subject is Element {
  return "setHorizontalAnchors" in subject;
}

function isScrollTrigger(
  subject: Element | Section | ScrollTrigger,
): subject is ScrollTrigger {
  // ScrollTrigger has no addMarkdownElement (Section) and no setHorizontalAnchors (Element).
  return !isElement(subject) && !("addMarkdownElement" in subject);
}

/** True for width and height — the size group whose anchors support fit-content mode. */
function isSizeSlot(slot: AnchorSlot): slot is "width" | "height" {
  return slot === "width" || slot === "height";
}

function fmtVal(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function isDerived(expr: AnchorExpression): boolean {
  return (
    !(expr instanceof ConstantAnchorExpression) &&
    !(expr instanceof OffsetAnchorExpression) &&
    !(expr instanceof FractionAnchorExpression)
  );
}

function inferExprType(expr: AnchorExpression): ExprType | "derived" {
  if (expr instanceof ConstantAnchorExpression) return "constant";
  if (expr instanceof OffsetAnchorExpression) return "offset";
  if (expr instanceof FractionAnchorExpression) return "fraction";
  return "derived";
}

function describeExpression(expr: AnchorExpression): string {
  if (expr instanceof ConstantAnchorExpression) return "constant";
  if (expr instanceof OffsetAnchorExpression) {
    const { offset } = expr;
    return offset === 0
      ? "anchored"
      : `anchored ${offset > 0 ? "+" : ""}${fmtVal(offset)}`;
  }
  if (expr instanceof FractionAnchorExpression)
    return `×${expr.fraction} of anchor`;
  return "derived";
}

// ── Operation builders ────────────────────────────────────────────────────────

function buildHSwapDerivedOp(
  element: Element,
  { currentDerived, newDerived }: { currentDerived: HSlot; newDerived: HSlot },
  onDone: () => void,
): EditOperation {
  const a = element.anchors;
  const pairs: Array<[HSlot, Anchor]> = [
    ["left", a.left],
    ["right", a.right],
    ["width", a.width],
  ];
  const derivedValue = pairs.find(([n]) => n === currentDerived)![1].value;

  // Snapshot: the two currently constrained anchors' expressions (for undo).
  const before: HorizontalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (name !== currentDerived) before[name] = anchor.expression;
  }

  // After: the formerly-derived anchor becomes a constant; the newDerived is excluded.
  const after: HorizontalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (name === newDerived) continue;
    after[name] =
      name === currentDerived
        ? new ConstantAnchorExpression(derivedValue)
        : anchor.expression;
  }

  return {
    execute: () => {
      element.setHorizontalAnchors(after);
      onDone();
    },
    undo: () => {
      element.setHorizontalAnchors(before);
      onDone();
    },
  };
}

function buildVSwapDerivedOp(
  subject: Element | Section | ScrollTrigger,
  { currentDerived, newDerived }: { currentDerived: VSlot; newDerived: VSlot },
  onDone: () => void,
): EditOperation {
  const a = subject.anchors;
  const pairs: Array<[VSlot, Anchor]> = [
    ["top", a.top],
    ["bottom", a.bottom],
    ["height", a.height],
  ];
  const derivedValue = pairs.find(([n]) => n === currentDerived)![1].value;

  const before: VerticalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (name !== currentDerived) before[name] = anchor.expression;
  }

  const after: VerticalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (name === newDerived) continue;
    after[name] =
      name === currentDerived
        ? new ConstantAnchorExpression(derivedValue)
        : anchor.expression;
  }

  return {
    execute: () => {
      subject.setVerticalAnchors(after);
      onDone();
    },
    undo: () => {
      subject.setVerticalAnchors(before);
      onDone();
    },
  };
}

function buildHConstantOp(
  element: Element,
  { slot, value }: { slot: HSlot; value: number },
  onDone: () => void,
): EditOperation {
  const a = element.anchors;
  const pairs: Array<[HSlot, Anchor]> = [
    ["left", a.left],
    ["right", a.right],
    ["width", a.width],
  ];
  const before: HorizontalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (!isDerived(anchor.expression)) before[name] = anchor.expression;
  }
  const after = {
    ...before,
    [slot]: new ConstantAnchorExpression(value),
  } as HorizontalAnchorSet;
  return {
    execute: () => {
      element.setHorizontalAnchors(after);
      onDone();
    },
    undo: () => {
      element.setHorizontalAnchors(before);
      onDone();
    },
  };
}

function buildVConstantOp(
  subject: Element | Section | ScrollTrigger,
  { slot, value }: { slot: VSlot; value: number },
  onDone: () => void,
): EditOperation {
  const a = subject.anchors;
  const pairs: Array<[VSlot, Anchor]> = [
    ["top", a.top],
    ["bottom", a.bottom],
    ["height", a.height],
  ];
  const before: VerticalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (!isDerived(anchor.expression)) before[name] = anchor.expression;
  }
  const after = {
    ...before,
    [slot]: new ConstantAnchorExpression(value),
  } as VerticalAnchorSet;
  return {
    execute: () => {
      subject.setVerticalAnchors(after);
      onDone();
    },
    undo: () => {
      subject.setVerticalAnchors(before);
      onDone();
    },
  };
}

function buildHRefOp(
  element: Element,
  {
    slot,
    base,
    exprFactory,
  }: {
    slot: HSlot;
    base: Anchor;
    exprFactory: (base: Anchor) => AnchorExpression;
  },
  onDone: () => void,
): EditOperation {
  const a = element.anchors;
  const pairs: Array<[HSlot, Anchor]> = [
    ["left", a.left],
    ["right", a.right],
    ["width", a.width],
  ];
  const before: HorizontalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (!isDerived(anchor.expression)) before[name] = anchor.expression;
  }
  // Snapshot the previous expression for the edited slot so undo can restore it.
  const prevExpr = a[slot].expression;
  const after = { ...before, [slot]: exprFactory(base) } as HorizontalAnchorSet;
  const undo = { ...before, [slot]: prevExpr } as HorizontalAnchorSet;
  return {
    execute: () => {
      element.setHorizontalAnchors(after);
      onDone();
    },
    undo: () => {
      element.setHorizontalAnchors(undo);
      onDone();
    },
  };
}

function buildVRefOp(
  subject: Element | Section | ScrollTrigger,
  {
    slot,
    base,
    exprFactory,
  }: {
    slot: VSlot;
    base: Anchor;
    exprFactory: (base: Anchor) => AnchorExpression;
  },
  onDone: () => void,
): EditOperation {
  const a = subject.anchors;
  const pairs: Array<[VSlot, Anchor]> = [
    ["top", a.top],
    ["bottom", a.bottom],
    ["height", a.height],
  ];
  const before: VerticalAnchorSet = {};
  for (const [name, anchor] of pairs) {
    if (!isDerived(anchor.expression)) before[name] = anchor.expression;
  }
  const prevExpr = a[slot].expression;
  const after = { ...before, [slot]: exprFactory(base) } as VerticalAnchorSet;
  const undo = { ...before, [slot]: prevExpr } as VerticalAnchorSet;
  return {
    execute: () => {
      subject.setVerticalAnchors(after);
      onDone();
    },
    undo: () => {
      subject.setVerticalAnchors(undo);
      onDone();
    },
  };
}

/**
 * Switches height INTO content-measured mode. The `option` (from
 * findVerticalPositionOption) carries the single non-derived position anchor to keep.
 *
 * Undo snapshots the current 2+1 vertical state (two user-set anchors) and
 * restores them via setVerticalAnchors, which implicitly clears content-dependent mode.
 */
function buildSetAutoHeightOp(
  element: Element,
  option: { top: AnchorExpression } | { bottom: AnchorExpression },
  onDone: () => void,
): EditOperation {
  const a = element.anchors;
  const vPairs: Array<[VSlot, Anchor]> = [
    ["top", a.top],
    ["bottom", a.bottom],
    ["height", a.height],
  ];
  // In the 2+1 system before this call, exactly two anchors are user-set.
  // Snapshot both so undo can fully restore the pre-fit-content layout.
  const before: VerticalAnchorSet = {};
  for (const [name, anchor] of vPairs) {
    if (!isDerived(anchor.expression)) before[name] = anchor.expression;
  }
  return {
    execute: () => {
      element.setAutoHeight(option);
      onDone();
    },
    undo: () => {
      // setVerticalAnchors clears contentDependentDimension automatically (CoreElement).
      element.setVerticalAnchors(before);
      onDone();
    },
  };
}

/**
 * Switches width INTO content-measured mode. Symmetric to buildSetAutoHeightOp.
 */
function buildSetAutoWidthOp(
  element: Element,
  option: { left: AnchorExpression } | { right: AnchorExpression },
  onDone: () => void,
): EditOperation {
  const a = element.anchors;
  const hPairs: Array<[HSlot, Anchor]> = [
    ["left", a.left],
    ["right", a.right],
    ["width", a.width],
  ];
  const before: HorizontalAnchorSet = {};
  for (const [name, anchor] of hPairs) {
    if (!isDerived(anchor.expression)) before[name] = anchor.expression;
  }
  return {
    execute: () => {
      element.setAutoWidth(option);
      onDone();
    },
    undo: () => {
      element.setHorizontalAnchors(before);
      onDone();
    },
  };
}

/**
 * Switches height OUT of content-measured mode by setting it to a new expression.
 * The existing position anchor (top or bottom) is preserved in the after state.
 *
 * Used instead of buildVRefOp / buildVConstantOp when entry.fitContent is true.
 * Those helpers snapshot only the non-derived anchors, but in fit-content mode only
 * one anchor is user-set (the position), which is not a valid VerticalAnchorSet for undo.
 *
 * Undo calls setAutoHeight with the position option captured before the switch.
 */
function buildFromFitContentVOp(
  element: Element,
  { slot, newExpr }: { slot: VSlot; newExpr: AnchorExpression },
  onDone: () => void,
): EditOperation {
  // Capture the position anchor BEFORE state changes — needed to restore fit-content on undo.
  const undoOption = findVerticalPositionOption(element);
  const a = element.anchors;
  // After state: keep the existing user-set position anchor; set the slot to newExpr.
  // In fit-content mode only top or bottom is user-set (height is measured-derived).
  const posPairs: Array<[VSlot, Anchor]> = [
    ["top", a.top],
    ["bottom", a.bottom],
  ];
  const after: VerticalAnchorSet = {};
  for (const [name, anchor] of posPairs) {
    if (!isDerived(anchor.expression)) after[name] = anchor.expression;
  }
  after[slot] = newExpr;
  return {
    execute: () => {
      // setVerticalAnchors clears contentDependentDimension automatically (CoreElement).
      element.setVerticalAnchors(after);
      onDone();
    },
    undo: () => {
      if (undoOption) element.setAutoHeight(undoOption);
      onDone();
    },
  };
}

/**
 * Switches width OUT of content-measured mode. Symmetric to buildFromFitContentVOp.
 */
function buildFromFitContentHOp(
  element: Element,
  { slot, newExpr }: { slot: HSlot; newExpr: AnchorExpression },
  onDone: () => void,
): EditOperation {
  const undoOption = findHorizontalPositionOption(element);
  const a = element.anchors;
  const posPairs: Array<[HSlot, Anchor]> = [
    ["left", a.left],
    ["right", a.right],
  ];
  const after: HorizontalAnchorSet = {};
  for (const [name, anchor] of posPairs) {
    if (!isDerived(anchor.expression)) after[name] = anchor.expression;
  }
  after[slot] = newExpr;
  return {
    execute: () => {
      element.setHorizontalAnchors(after);
      onDone();
    },
    undo: () => {
      if (undoOption) element.setAutoWidth(undoOption);
      onDone();
    },
  };
}

/**
 * Updates the position anchor of a height-auto element while keeping it in
 * content-measured mode. Used when the user changes a top/bottom offset/fraction
 * expression while height is already content-dependent — setVerticalAnchors would
 * require 2 constraints but fit-content mode only has 1 (the position).
 */
function buildAutoHeightPositionOp(
  element: Element,
  {
    slot,
    newExpr,
    prevExpr,
  }: {
    slot: "top" | "bottom";
    newExpr: AnchorExpression;
    prevExpr: AnchorExpression;
  },
  onDone: () => void,
): EditOperation {
  const toOption = (
    expr: AnchorExpression,
  ): { top: AnchorExpression } | { bottom: AnchorExpression } =>
    slot === "top" ? { top: expr } : { bottom: expr };
  return {
    execute: () => {
      element.setAutoHeight(toOption(newExpr));
      onDone();
    },
    undo: () => {
      element.setAutoHeight(toOption(prevExpr));
      onDone();
    },
  };
}

/** Symmetric to buildAutoHeightPositionOp for width-auto elements. */
function buildAutoWidthPositionOp(
  element: Element,
  {
    slot,
    newExpr,
    prevExpr,
  }: {
    slot: "left" | "right";
    newExpr: AnchorExpression;
    prevExpr: AnchorExpression;
  },
  onDone: () => void,
): EditOperation {
  const toOption = (
    expr: AnchorExpression,
  ): { left: AnchorExpression } | { right: AnchorExpression } =>
    slot === "left" ? { left: expr } : { right: expr };
  return {
    execute: () => {
      element.setAutoWidth(toOption(newExpr));
      onDone();
    },
    undo: () => {
      element.setAutoWidth(toOption(prevExpr));
      onDone();
    },
  };
}

// ── Panel ─────────────────────────────────────────────────────────────────────

/**
 * Sidebar panel for editing the anchor (layout constraint) expressions of a single
 * selected element or section.
 *
 * **Two views:**
 * - *List view* — shows all anchors for the subject in two groups (Horizontal / Vertical),
 *   one row per anchor displaying its current computed value and expression summary.
 *   Clicking a non-locked row drills into the detail view.
 * - *Detail view* — shows the full editor for one anchor: a type dropdown (constant /
 *   anchored / fraction / fit-content) and type-specific input fields.
 *
 * **Two-stage reference pick flow** (offset and fraction types):
 * Setting a reference-type expression requires knowing both (a) which element/section
 * to reference and (b) which anchor slot on that target. The panel handles this as a
 * two-stage flow managed by `pickInProgress_` and `anchorPickingTarget_`:
 *
 *   Stage 1 — `pickInProgress_ = true`: the panel auto-activates `AnchorPickerTool`
 *   via `requestPick_`, which interrupts the current selection tool. The panel renders
 *   a "click an element…" prompt. When the user clicks, the callback fires.
 *
 *   Stage 2 — `anchorPickingTarget_ !== null`: target is known; show available slots
 *   on that target. Clicking a slot builds and pushes the operation, then clears `anchorPickingTarget_`.
 *
 *   A cancel (Escape) during Stage 1 reverts `detailType_` to null if the anchor's
 *   actual expression doesn't yet match the chosen type, preventing a stale type display.
 *
 * **`detailType_`** shadows the expression's actual inferred type to allow the user
 * to change the type dropdown before committing a new expression. It is cleared when:
 * leaving the detail view, cancelling a pick, or after a successful commit (via `onDone`).
 *
 * **Fit-content mode** complicates the operation builders: in this mode only one anchor
 * (the position) is user-set, not two. The normal H/V ref/constant builders snapshot
 * all non-derived anchors as the before-state, which would be an incomplete VerticalAnchorSet
 * in fit-content mode. `buildFromFitContentVOp` / `buildFromFitContentHOp` and
 * `buildAutoHeight/WidthPositionOp` handle these transitions correctly.
 */
export class AnchorsPanel implements SidebarPanel {
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;
  private requestPick_: (callback: (result: AnchorPickResult) => void) => void;

  private detail_: DetailState | null = null;
  // Tracks the user's type selection in the detail view. Null means "use the
  // anchor's actual expression type". Cleared when leaving the detail view or
  // when a pick is cancelled before the expression is committed.
  private detailType_: ExprType | null = null;
  // True only on the first render after entering a detail view — drives auto-focus.
  private focusOnRender_ = false;
  // True while the AnchorPickerTool is active waiting for a canvas click.
  private pickInProgress_ = false;
  // The element/section/trigger chosen in Stage 1. Cleared after the slot is
  // committed or when the pick flow is exited.
  private anchorPickingTarget_: Element | Section | ScrollTrigger | null = null;

  constructor(
    state: EditorState,
    push: PushOperation,
    requestPick: (callback: (result: AnchorPickResult) => void) => void,
  ) {
    this.state_ = state;
    this.push_ = push;
    this.requestPick_ = requestPick;
    this.element = document.createElement("div");
    this.update();
  }

  update(): void {
    this.element.innerHTML = "";
    const sel = this.state_.viewController.selection;

    const { elements, sections, triggers } = sel;
    let subject: Element | Section | ScrollTrigger | null = null;
    let kind: "element" | "section" | "trigger" | null = null;

    if (elements.size === 1) {
      subject = [...elements][0]!;
      kind = "element";
    } else if (sections.size === 1) {
      subject = [...sections][0]!;
      kind = "section";
    } else if (triggers.size === 1) {
      subject = [...triggers][0]!;
      kind = "trigger";
    }

    // Clear drill-down when the subject changes.
    if (this.detail_ && this.detail_.subject !== subject) {
      this.detail_ = null;
      this.detailType_ = null;
      this.pickInProgress_ = false;
      this.anchorPickingTarget_ = null;
      sel.clearFocusedElement();
    }

    if (!subject) {
      const multi = elements.size > 1 || sections.size > 1 || triggers.size > 1;
      this.renderEmpty_(
        multi
          ? "Select a single element, section, or trigger to edit anchors."
          : "Select an element, section, or trigger to edit anchors.",
      );
      return;
    }

    if (this.detail_) {
      this.renderDetail_(subject, this.detail_.entry);
    } else if (kind === "element") {
      this.renderElementAnchors_(subject as Element);
    } else if (kind === "trigger") {
      this.renderTriggerAnchors_(subject as ScrollTrigger);
    } else {
      this.renderSectionAnchors_(subject as Section);
    }
  }

  dispose(): void {}

  // ── List view ─────────────────────────────────────────────────────────────

  private renderElementAnchors_(el: Element): void {
    const a = el.anchors;
    // Mark the size anchor that matches the element's content-dependent dimension
    // so the list row and detail view can display it correctly as fit-content.
    const cdd = el.contentDependentDimension;
    this.renderGroup_(el, "Horizontal", [
      { name: "left", anchor: a.left, axis: "horizontal" },
      { name: "right", anchor: a.right, axis: "horizontal" },
      {
        name: "width",
        anchor: a.width,
        axis: "horizontal",
        fitContent: cdd === "width",
      },
    ]);
    this.renderGroup_(el, "Vertical", [
      { name: "top", anchor: a.top, axis: "vertical" },
      { name: "bottom", anchor: a.bottom, axis: "vertical" },
      {
        name: "height",
        anchor: a.height,
        axis: "vertical",
        fitContent: cdd === "height",
      },
    ]);
  }

  private renderTriggerAnchors_(trigger: ScrollTrigger): void {
    const a = trigger.anchors;
    this.renderGroup_(trigger, "Vertical", [
      { name: "top", anchor: a.top, axis: "vertical" },
      { name: "height", anchor: a.height, axis: "vertical" },
      { name: "bottom", anchor: a.bottom, axis: "vertical" },
    ]);
  }

  private renderSectionAnchors_(sec: Section): void {
    const a = sec.anchors;
    this.renderGroup_(sec, "Vertical", [
      {
        name: "top",
        anchor: a.top,
        axis: "vertical",
        locked: true,
        lockNote: "linked to section above",
      },
      { name: "height", anchor: a.height, axis: "vertical" },
      { name: "bottom", anchor: a.bottom, axis: "vertical" },
    ]);
  }

  private renderGroup_(
    subject: Element | Section | ScrollTrigger,
    title: string,
    entries: AnchorEntry[],
  ): void {
    const group = document.createElement("div");
    group.className = "re-anchor-group";

    const titleEl = document.createElement("div");
    titleEl.className = "re-anchor-group__title";
    titleEl.textContent = title;
    group.appendChild(titleEl);

    for (const entry of entries) {
      group.appendChild(this.makeListRow_(subject, entry));
    }

    this.element.appendChild(group);
  }

  private makeListRow_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
  ): HTMLElement {
    const row = document.createElement("div");
    row.className =
      "re-anchor-row" +
      (entry.locked ? " re-anchor-row--locked" : " re-anchor-row--clickable");

    const name = document.createElement("span");
    name.className = "re-anchor-row__name";
    name.textContent = entry.name;

    const value = document.createElement("span");
    value.className = "re-anchor-row__value";
    value.textContent = fmtVal(entry.anchor.value);

    const expr = document.createElement("span");
    expr.className = "re-anchor-row__expr";
    expr.textContent = entry.locked
      ? (entry.lockNote ?? "locked")
      : entry.fitContent
        ? "fit content"
        : describeExpression(entry.anchor.expression);

    row.appendChild(name);
    row.appendChild(value);
    row.appendChild(expr);

    if (!entry.locked) {
      row.addEventListener("click", () => {
        this.detail_ = { subject, entry };
        this.focusOnRender_ = true;
        this.update();
      });
    }

    return row;
  }

  // ── Detail view ───────────────────────────────────────────────────────────

  private renderDetail_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
  ): void {
    // Keep the subject element visually focused throughout the detail view,
    // including after a target pick overwrites focus. Sections have no chrome.
    if (isElement(subject)) {
      this.state_.viewController.selection.setFocusedElement(subject);
    }

    const back = document.createElement("button");
    back.className = "re-anchor-back";
    back.textContent = `← ${entry.name}`;
    back.addEventListener("click", () => {
      this.detail_ = null;
      this.detailType_ = null;
      this.pickInProgress_ = false;
      this.anchorPickingTarget_ = null;
      this.state_.viewController.selection.clearFocusedElement();
      this.update();
    });
    this.element.appendChild(back);

    const divider = document.createElement("div");
    divider.className = "re-anchor-detail-divider";
    this.element.appendChild(divider);

    const valueRow = document.createElement("div");
    valueRow.className = "re-anchor-row";
    const valueLabel = document.createElement("span");
    valueLabel.className = "re-anchor-row__name";
    valueLabel.textContent = "value";
    const valueNum = document.createElement("span");
    valueNum.className = "re-anchor-row__value";
    valueNum.textContent = fmtVal(entry.anchor.value);
    valueRow.appendChild(valueLabel);
    valueRow.appendChild(valueNum);
    this.element.appendChild(valueRow);

    const expr = entry.anchor.expression;
    const exprType = inferExprType(expr);

    // Re-derive fitContent from live model state; entry.fitContent may be stale if
    // the model changed while this detail view was open (e.g. the user just switched
    // into fit-content mode via the type dropdown and update() re-entered here).
    const fitContent =
      isSizeSlot(entry.name) && isElement(subject)
        ? subject.contentDependentDimension === entry.name
        : false;

    // A size anchor in content-measured mode carries a DerivedAnchorExpression, but
    // unlike arithmetic-derived anchors it is user-configurable. Override the base
    // type so it gets the fit-content detail branch instead of the swap-derived dropdown.
    const baseType: ExprType | "derived" =
      fitContent && exprType === "derived" ? "fitContent" : exprType;

    if (baseType === "derived") {
      this.renderSwapDerivedDropdown_(subject, entry);
      return;
    }

    const effectiveType = this.detailType_ ?? baseType;
    // Disable the type selector while a pick is in progress so the user can't
    // inadvertently start a second pick by changing the type mid-flow.
    const inPickFlow =
      this.pickInProgress_ || this.anchorPickingTarget_ !== null;
    // Only size anchors on elements support fit-content mode.
    const showFitContent = isSizeSlot(entry.name) && isElement(subject);

    this.renderTypeDropdown_({
      current: effectiveType,
      disabled: inPickFlow,
      showFitContent,
      onChange: (picked) => {
        if (picked === "fitContent") {
          // Commit the switch immediately — no pick flow needed, we keep the
          // existing position anchor and just wrap height/width as measured.
          const element = subject as Element;
          const onDone = () => {
            this.detailType_ = null;
            this.update();
          };
          if (entry.axis === "horizontal") {
            const option = findHorizontalPositionOption(element);
            if (option) {
              this.push_(buildSetAutoWidthOp(element, option, onDone));
            } else {
              this.update(); // No valid position anchor — revert the dropdown.
            }
          } else {
            const option = findVerticalPositionOption(element);
            if (option) {
              this.push_(buildSetAutoHeightOp(element, option, onDone));
            } else {
              this.update();
            }
          }
        } else {
          this.detailType_ = picked;
          this.anchorPickingTarget_ = null;
          this.update();
        }
      },
    });

    if (effectiveType === "fitContent") {
      // Already in fit-content mode — show a label. The user changes the type
      // dropdown above to exit this mode.
      this.renderFitContentDetail_(entry);
    } else if (effectiveType === "constant") {
      const initialValue =
        expr instanceof ConstantAnchorExpression
          ? expr.value
          : entry.anchor.value;
      const alwaysCommit = !(expr instanceof ConstantAnchorExpression);
      this.renderNumberEdit_({
        label: "set",
        initialValue,
        alwaysCommit,
        onCommit: (v) => {
          const newExpr = new ConstantAnchorExpression(v);
          const onDone = () => this.update();
          // When exiting fit-content mode via constant, use a specialized op:
          // the normal op helpers snapshot only non-derived anchors, but in
          // fit-content mode only one anchor (the position) is user-set, so
          // the normal snapshot would be incomplete and invalid as an undo state.
          const op = fitContent
            ? entry.axis === "horizontal"
              ? buildFromFitContentHOp(
                  subject as Element,
                  { slot: entry.name as HSlot, newExpr },
                  onDone,
                )
              : buildFromFitContentVOp(
                  subject as Element,
                  { slot: entry.name as VSlot, newExpr },
                  onDone,
                )
            : entry.axis === "horizontal"
              ? buildHConstantOp(
                  subject as Element,
                  { slot: entry.name as HSlot, value: v },
                  onDone,
                )
              : buildVConstantOp(
                  subject,
                  { slot: entry.name as VSlot, value: v },
                  onDone,
                );
          this.push_(op);
        },
      });
    } else if (effectiveType === "offset") {
      if (expr instanceof OffsetAnchorExpression && !inPickFlow) {
        this.renderOffsetEdit_(subject, entry, expr);
      } else {
        this.renderAnchorPicking_(subject, entry, "offset");
      }
    } else {
      if (expr instanceof FractionAnchorExpression && !inPickFlow) {
        this.renderFractionEdit_(subject, entry, expr);
      } else {
        this.renderAnchorPicking_(subject, entry, "fraction");
      }
    }
  }

  private renderTypeDropdown_({
    current,
    disabled,
    showFitContent,
    onChange,
  }: {
    current: ExprType;
    disabled: boolean;
    showFitContent: boolean;
    onChange: (type: ExprType) => void;
  }): void {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "type";

    const select = document.createElement("select");
    select.className = "re-style-select re-anchor-select";
    select.disabled = disabled;

    const options: Array<[ExprType, string]> = [
      ["constant", "Constant"],
      ["offset", "Anchored"],
      ["fraction", "Fraction"],
    ];
    if (showFitContent) {
      options.push(["fitContent", "Fit content"]);
    }
    for (const [value, text] of options) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = text;
      if (value === current) opt.selected = true;
      select.appendChild(opt);
    }

    select.addEventListener("change", () => {
      onChange(select.value as ExprType);
    });

    row.appendChild(label);
    row.appendChild(select);
    this.element.appendChild(row);
  }

  /** Shows a static description when the anchor is in content-measured mode. */
  private renderFitContentDetail_(entry: AnchorEntry): void {
    const msg = document.createElement("p");
    msg.className = "re-anchor-pick-prompt";
    msg.textContent =
      entry.name === "width"
        ? "Width is measured from content. Change type above to override."
        : "Height is measured from content. Change type above to override.";
    this.element.appendChild(msg);
  }

  private renderSwapDerivedDropdown_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
  ): void {
    // For sections, top is system-managed and must never become a free constraint,
    // so exclude it from the options the user can make derived. Triggers don't
    // have this restriction — all three vertical anchors are user-settable.
    const isActualSection = !isElement(subject) && !isScrollTrigger(subject);
    const allSlots: AnchorSlot[] =
      entry.axis === "horizontal"
        ? ["left", "right", "width"]
        : ["top", "bottom", "height"];

    // Exclude the content-dependent size slot from swap options. Its expression is
    // managed by fit-content mode (not arithmetic derivation), so offering to "swap"
    // it would mislead the user. They must exit fit-content mode via that slot's own
    // detail view instead.
    const fitContentSlot: AnchorSlot | null =
      isElement(subject) &&
      entry.axis === "horizontal" &&
      subject.contentDependentDimension === "width"
        ? "width"
        : isElement(subject) &&
            entry.axis === "vertical" &&
            subject.contentDependentDimension === "height"
          ? "height"
          : null;

    const options = allSlots.filter(
      (s) =>
        s !== entry.name &&
        !(isActualSection && s === "top") &&
        s !== fitContentSlot,
    );

    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "make derived";

    const select = document.createElement("select");
    select.className = "re-style-select re-anchor-select";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "— swap with —";
    placeholder.selected = true;
    placeholder.disabled = true;
    select.appendChild(placeholder);

    for (const slot of options) {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      select.appendChild(opt);
    }

    select.addEventListener("change", () => {
      const newDerived = select.value as AnchorSlot;
      if (!newDerived) return;
      const op =
        entry.axis === "horizontal"
          ? buildHSwapDerivedOp(
              subject as Element,
              {
                currentDerived: entry.name as HSlot,
                newDerived: newDerived as HSlot,
              },
              () => this.update(),
            )
          : buildVSwapDerivedOp(
              subject,
              {
                currentDerived: entry.name as VSlot,
                newDerived: newDerived as VSlot,
              },
              () => this.update(),
            );
      this.push_(op);
    });

    row.appendChild(label);
    row.appendChild(select);
    this.element.appendChild(row);
  }

  // ── Anchor picking ────────────────────────────────────────────────────────

  private renderAnchorPicking_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
    type: "offset" | "fraction",
  ): void {
    // Stage 2: target has been picked — show the slot list.
    if (this.anchorPickingTarget_ !== null) {
      this.renderSlotList_(subject, entry, type);
      return;
    }

    // Stage 1: auto-start the pick tool if not already waiting.
    if (!this.pickInProgress_) {
      this.pickInProgress_ = true;
      this.requestPick_((result) => {
        this.pickInProgress_ = false;
        if (result !== null) {
          this.anchorPickingTarget_ = result;
        } else {
          // Cancelled — if the expression doesn't yet match the intended type,
          // revert the type selection so the edit view reflects actual state.
          const matchesType =
            type === "offset"
              ? entry.anchor.expression instanceof OffsetAnchorExpression
              : entry.anchor.expression instanceof FractionAnchorExpression;
          if (!matchesType) this.detailType_ = null;
        }
        this.update();
      });
    }

    const prompt = document.createElement("p");
    prompt.className = "re-anchor-pick-prompt";
    prompt.textContent =
      "Click an element, section, or scroll trigger in the canvas, or press Escape to cancel.";
    this.element.appendChild(prompt);
  }

  private renderSlotList_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
    type: "offset" | "fraction",
  ): void {
    const pickedTarget = this.anchorPickingTarget_!;
    const group = slotPickGroup(entry.name);
    const pres = this.state_.presentation;

    // Target summary row with "change" button.
    const targetRow = document.createElement("div");
    targetRow.className = "re-anchor-edit-row";
    const targetLabel = document.createElement("span");
    targetLabel.className = "re-anchor-row__name";
    targetLabel.textContent = "target";
    const targetName = document.createElement("span");
    targetName.className = "re-anchor-row__value";
    targetName.textContent = pres
      ? resolveTargetLabel(pickedTarget, pres)
      : "?";
    const changeBtn = document.createElement("button");
    changeBtn.className = "re-anchor-repick";
    changeBtn.textContent = "change";
    changeBtn.addEventListener("click", () => {
      this.anchorPickingTarget_ = null;
      this.pickInProgress_ = true;
      this.requestPick_((result) => {
        this.pickInProgress_ = false;
        if (result !== null) {
          this.anchorPickingTarget_ = result;
        } else {
          // Same revert logic as auto-start cancel.
          const matchesType =
            type === "offset"
              ? entry.anchor.expression instanceof OffsetAnchorExpression
              : entry.anchor.expression instanceof FractionAnchorExpression;
          if (!matchesType) this.detailType_ = null;
        }
        this.update();
      });
      this.update();
    });
    targetRow.appendChild(targetLabel);
    targetRow.appendChild(targetName);
    targetRow.appendChild(changeBtn);
    this.element.appendChild(targetRow);

    // Self-pick is only valid for size anchors (width/height), not position.
    const isSelf = pickedTarget === subject;
    const slots =
      isSelf && group !== "s" ? [] : validSlotsForGroup(group, pickedTarget);

    if (slots.length === 0) {
      const msg = document.createElement("span");
      msg.className = "re-panel-empty";
      msg.textContent = "No compatible anchors on this target.";
      this.element.appendChild(msg);
      return;
    }

    const slotTitle = document.createElement("div");
    slotTitle.className = "re-anchor-group__title";
    slotTitle.textContent = "anchor";
    this.element.appendChild(slotTitle);

    for (const slot of slots) {
      const base = (
        pickedTarget.anchors as Record<AnchorSlot, Anchor | undefined>
      )[slot];
      if (!base) continue;

      const row = document.createElement("div");
      row.className = "re-anchor-row re-anchor-row--clickable";

      const slotName = document.createElement("span");
      slotName.className = "re-anchor-row__name";
      slotName.textContent = slot;

      const slotVal = document.createElement("span");
      slotVal.className = "re-anchor-row__value";
      slotVal.textContent = fmtVal(base.value);

      row.appendChild(slotName);
      row.appendChild(slotVal);

      row.addEventListener("click", () => {
        const exprFactory =
          type === "offset"
            ? (b: Anchor) => new OffsetAnchorExpression(b, 0)
            : (b: Anchor) => new FractionAnchorExpression(b, 1);
        const onDone = () => {
          this.anchorPickingTarget_ = null;
          this.update();
        };
        // When exiting fit-content mode via a reference anchor, use a specialized
        // op so that undo correctly restores fit-content mode rather than attempting
        // to snapshot two user-set anchors (only one exists in fit-content state).
        const op = entry.fitContent
          ? entry.axis === "horizontal"
            ? buildFromFitContentHOp(
                subject as Element,
                { slot: entry.name as HSlot, newExpr: exprFactory(base) },
                onDone,
              )
            : buildFromFitContentVOp(
                subject as Element,
                { slot: entry.name as VSlot, newExpr: exprFactory(base) },
                onDone,
              )
          : entry.axis === "horizontal"
            ? buildHRefOp(
                subject as Element,
                { slot: entry.name as HSlot, base, exprFactory },
                onDone,
              )
            : buildVRefOp(
                subject,
                { slot: entry.name as VSlot, base, exprFactory },
                onDone,
              );
        this.push_(op);
      });

      this.element.appendChild(row);
    }
  }

  // ── Inline slot list ──────────────────────────────────────────────────────

  /** Renders the anchor slot list for `target` inline, highlighting `currentBase`.
   *  Clicking a non-current slot calls `onSlotSelected` with the new base anchor. */
  private renderInlineSlotList_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
    currentBase: Anchor,
    target: Element | Section | ScrollTrigger,
    onSlotSelected: (base: Anchor) => void,
  ): void {
    const group = slotPickGroup(entry.name);
    const isSelf = target === subject;
    const slots =
      isSelf && group !== "s" ? [] : validSlotsForGroup(group, target);

    if (slots.length === 0) {
      const msg = document.createElement("span");
      msg.className = "re-panel-empty";
      msg.textContent = "No compatible anchors on this target.";
      this.element.appendChild(msg);
      return;
    }

    const slotTitle = document.createElement("div");
    slotTitle.className = "re-anchor-group__title";
    slotTitle.textContent = "anchor";
    this.element.appendChild(slotTitle);

    for (const slot of slots) {
      const base = (target.anchors as Record<AnchorSlot, Anchor | undefined>)[
        slot
      ];
      if (!base) continue;

      const isCurrent = base === currentBase;
      const row = document.createElement("div");
      row.className =
        "re-anchor-row" +
        (isCurrent ? " re-anchor-row--current" : " re-anchor-row--clickable");

      const slotName = document.createElement("span");
      slotName.className = "re-anchor-row__name";
      slotName.textContent = slot;

      const slotVal = document.createElement("span");
      slotVal.className = "re-anchor-row__value";
      slotVal.textContent = fmtVal(base.value);

      row.appendChild(slotName);
      row.appendChild(slotVal);

      if (!isCurrent) {
        row.addEventListener("click", () => onSlotSelected(base));
      }

      this.element.appendChild(row);
    }
  }

  // ── Offset / fraction editing ─────────────────────────────────────────────

  private renderOffsetEdit_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
    expr: OffsetAnchorExpression,
  ): void {
    // OffsetAnchorExpression always constructs with exactly one dependency (base).
    const base = expr.dependencies[0]!;
    const pres = this.state_.presentation;
    const info = pres ? findAnchorInfo(base, pres) : null;

    // When the size axis is in fit-content mode, editing the position anchor must use
    // setAutoHeight/Width (which keeps content-measured mode) rather than
    // setVerticalAnchors/setHorizontalAnchors, which requires 2 constraints but
    // fit-content mode only has 1 user-set anchor (the position).
    const cdd = isElement(subject) ? subject.contentDependentDimension : "none";
    const sizeInFitContent =
      (entry.axis === "vertical" && cdd === "height") ||
      (entry.axis === "horizontal" && cdd === "width");

    // Target element row with "change" button.
    const elRow = document.createElement("div");
    elRow.className = "re-anchor-edit-row";
    const elLabel = document.createElement("span");
    elLabel.className = "re-anchor-row__name";
    elLabel.textContent = "element";
    const elVal = document.createElement("span");
    elVal.className = "re-anchor-row__value";
    elVal.textContent = info?.targetLabel ?? "?";
    const changeElBtn = document.createElement("button");
    changeElBtn.className = "re-anchor-repick";
    changeElBtn.textContent = "change";
    changeElBtn.addEventListener("click", () => {
      this.anchorPickingTarget_ = null;
      this.pickInProgress_ = true;
      this.requestPick_((result) => {
        this.pickInProgress_ = false;
        if (result !== null) this.anchorPickingTarget_ = result;
        this.update();
      });
      this.update();
    });
    elRow.appendChild(elLabel);
    elRow.appendChild(elVal);
    elRow.appendChild(changeElBtn);
    this.element.appendChild(elRow);

    // Always-visible anchor slot list for the current target.
    if (info !== null) {
      this.renderInlineSlotList_(
        subject,
        entry,
        base,
        info.target,
        (newBase) => {
          const newExpr = new OffsetAnchorExpression(newBase, expr.offset);
          const onDone = () => this.update();
          const op = sizeInFitContent
            ? entry.axis === "horizontal"
              ? buildAutoWidthPositionOp(
                  subject as Element,
                  {
                    slot: entry.name as "left" | "right",
                    newExpr,
                    prevExpr: expr,
                  },
                  onDone,
                )
              : buildAutoHeightPositionOp(
                  subject as Element,
                  {
                    slot: entry.name as "top" | "bottom",
                    newExpr,
                    prevExpr: expr,
                  },
                  onDone,
                )
            : entry.axis === "horizontal"
              ? buildHRefOp(
                  subject as Element,
                  {
                    slot: entry.name as HSlot,
                    base: newBase,
                    exprFactory: (b) =>
                      new OffsetAnchorExpression(b, expr.offset),
                  },
                  onDone,
                )
              : buildVRefOp(
                  subject,
                  {
                    slot: entry.name as VSlot,
                    base: newBase,
                    exprFactory: (b) =>
                      new OffsetAnchorExpression(b, expr.offset),
                  },
                  onDone,
                );
          this.push_(op);
        },
      );
    }

    this.renderNumberEdit_({
      label: "offset",
      initialValue: expr.offset,
      alwaysCommit: false,
      onCommit: (v) => {
        const newExpr = new OffsetAnchorExpression(base, v);
        const onDone = () => this.update();
        const op = sizeInFitContent
          ? entry.axis === "horizontal"
            ? buildAutoWidthPositionOp(
                subject as Element,
                {
                  slot: entry.name as "left" | "right",
                  newExpr,
                  prevExpr: expr,
                },
                onDone,
              )
            : buildAutoHeightPositionOp(
                subject as Element,
                {
                  slot: entry.name as "top" | "bottom",
                  newExpr,
                  prevExpr: expr,
                },
                onDone,
              )
          : entry.axis === "horizontal"
            ? buildHRefOp(
                subject as Element,
                {
                  slot: entry.name as HSlot,
                  base,
                  exprFactory: (b) => new OffsetAnchorExpression(b, v),
                },
                onDone,
              )
            : buildVRefOp(
                subject,
                {
                  slot: entry.name as VSlot,
                  base,
                  exprFactory: (b) => new OffsetAnchorExpression(b, v),
                },
                onDone,
              );
        this.push_(op);
      },
    });
  }

  private renderFractionEdit_(
    subject: Element | Section | ScrollTrigger,
    entry: AnchorEntry,
    expr: FractionAnchorExpression,
  ): void {
    // FractionAnchorExpression always constructs with exactly one dependency (base).
    const base = expr.dependencies[0]!;
    const pres = this.state_.presentation;
    const info = pres ? findAnchorInfo(base, pres) : null;

    const cdd = isElement(subject) ? subject.contentDependentDimension : "none";
    const sizeInFitContent =
      (entry.axis === "vertical" && cdd === "height") ||
      (entry.axis === "horizontal" && cdd === "width");

    // Target element row with "change" button.
    const elRow = document.createElement("div");
    elRow.className = "re-anchor-edit-row";
    const elLabel = document.createElement("span");
    elLabel.className = "re-anchor-row__name";
    elLabel.textContent = "element";
    const elVal = document.createElement("span");
    elVal.className = "re-anchor-row__value";
    elVal.textContent = info?.targetLabel ?? "?";
    const changeElBtn = document.createElement("button");
    changeElBtn.className = "re-anchor-repick";
    changeElBtn.textContent = "change";
    changeElBtn.addEventListener("click", () => {
      this.anchorPickingTarget_ = null;
      this.pickInProgress_ = true;
      this.requestPick_((result) => {
        this.pickInProgress_ = false;
        if (result !== null) this.anchorPickingTarget_ = result;
        this.update();
      });
      this.update();
    });
    elRow.appendChild(elLabel);
    elRow.appendChild(elVal);
    elRow.appendChild(changeElBtn);
    this.element.appendChild(elRow);

    // Always-visible anchor slot list for the current target.
    if (info !== null) {
      this.renderInlineSlotList_(
        subject,
        entry,
        base,
        info.target,
        (newBase) => {
          const newExpr = new FractionAnchorExpression(newBase, expr.fraction);
          const onDone = () => this.update();
          const op = sizeInFitContent
            ? entry.axis === "horizontal"
              ? buildAutoWidthPositionOp(
                  subject as Element,
                  {
                    slot: entry.name as "left" | "right",
                    newExpr,
                    prevExpr: expr,
                  },
                  onDone,
                )
              : buildAutoHeightPositionOp(
                  subject as Element,
                  {
                    slot: entry.name as "top" | "bottom",
                    newExpr,
                    prevExpr: expr,
                  },
                  onDone,
                )
            : entry.axis === "horizontal"
              ? buildHRefOp(
                  subject as Element,
                  {
                    slot: entry.name as HSlot,
                    base: newBase,
                    exprFactory: (b) =>
                      new FractionAnchorExpression(b, expr.fraction),
                  },
                  onDone,
                )
              : buildVRefOp(
                  subject,
                  {
                    slot: entry.name as VSlot,
                    base: newBase,
                    exprFactory: (b) =>
                      new FractionAnchorExpression(b, expr.fraction),
                  },
                  onDone,
                );
          this.push_(op);
        },
      );
    }

    this.renderNumberEdit_({
      label: "fraction",
      initialValue: expr.fraction,
      alwaysCommit: false,
      onCommit: (v) => {
        const newExpr = new FractionAnchorExpression(base, v);
        const onDone = () => this.update();
        const op = sizeInFitContent
          ? entry.axis === "horizontal"
            ? buildAutoWidthPositionOp(
                subject as Element,
                {
                  slot: entry.name as "left" | "right",
                  newExpr,
                  prevExpr: expr,
                },
                onDone,
              )
            : buildAutoHeightPositionOp(
                subject as Element,
                {
                  slot: entry.name as "top" | "bottom",
                  newExpr,
                  prevExpr: expr,
                },
                onDone,
              )
          : entry.axis === "horizontal"
            ? buildHRefOp(
                subject as Element,
                {
                  slot: entry.name as HSlot,
                  base,
                  exprFactory: (b) => new FractionAnchorExpression(b, v),
                },
                onDone,
              )
            : buildVRefOp(
                subject,
                {
                  slot: entry.name as VSlot,
                  base,
                  exprFactory: (b) => new FractionAnchorExpression(b, v),
                },
                onDone,
              );
        this.push_(op);
      },
    });
  }

  // ── Shared number input ───────────────────────────────────────────────────

  private renderNumberEdit_({
    label,
    initialValue,
    alwaysCommit,
    onCommit,
  }: {
    label: string;
    initialValue: number;
    alwaysCommit: boolean;
    onCommit: (value: number) => void;
  }): void {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const labelEl = document.createElement("span");
    labelEl.className = "re-anchor-row__name";
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.type = "number";
    input.className = "re-style-input re-style-input--number";
    input.value = fmtVal(initialValue);

    row.appendChild(labelEl);
    row.appendChild(input);
    this.element.appendChild(row);

    if (this.focusOnRender_) {
      this.focusOnRender_ = false;
      requestAnimationFrame(() => input.focus());
    }

    let committed = false;

    const doCommit = () => {
      if (committed) return;
      committed = true;
      const v = parseFloat(input.value);
      if (!isNaN(v) && (alwaysCommit || v !== initialValue)) {
        onCommit(v);
      }
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doCommit();
      if (e.key === "Escape") {
        committed = true;
        this.update();
      }
    });
    input.addEventListener("blur", doCommit);
  }

  private renderEmpty_(message: string): void {
    const msg = document.createElement("span");
    msg.className = "re-panel-empty";
    msg.textContent = message;
    this.element.appendChild(msg);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type PickGroup = "h" | "v" | "s";

/** Which pick group a slot belongs to.
 *  h = left/right (horizontal position)
 *  v = top/bottom (vertical position)
 *  s = width/height (size — cross-axis allowed for aspect ratio) */
function slotPickGroup(slot: AnchorSlot): PickGroup {
  if (slot === "left" || slot === "right") return "h";
  if (slot === "top" || slot === "bottom") return "v";
  return "s";
}

/** Anchor slots on `target` that are valid picks for `group`. */
function validSlotsForGroup(
  group: PickGroup,
  target: Element | Section | ScrollTrigger,
): AnchorSlot[] {
  if (isScrollTrigger(target)) {
    // Triggers are vertical-only; no horizontal anchors exist on them.
    if (group === "h") return [];
    if (group === "v") return ["top", "bottom"];
    return ["height"]; // "s"
  }
  const isSection = !isElement(target);
  if (group === "h") return isSection ? [] : ["left", "right"];
  if (group === "v") return ["top", "bottom"];
  // "s" — size anchors; cross-axis allowed so both width and height are valid
  return isSection ? ["height"] : ["width", "height"];
}

type AnchorInfo = {
  target: Element | Section | ScrollTrigger;
  targetLabel: string;
  slot: AnchorSlot;
};

/** Locate the owner and slot name of a base anchor within the presentation. */
function findAnchorInfo(anchor: Anchor, pres: Presentation): AnchorInfo | null {
  const vSlots: VSlot[] = ["top", "bottom", "height"];
  const hSlots: HSlot[] = ["left", "right", "width"];
  const allSlots: AnchorSlot[] = [...hSlots, ...vSlots];
  for (const section of pres.root.getSections()) {
    const sa = section.anchors as Record<AnchorSlot, Anchor | undefined>;
    for (const slot of vSlots) {
      if (sa[slot] === anchor)
        return { target: section, targetLabel: section.name, slot };
    }
    for (const el of section.getElements()) {
      const ea = el.anchors as Record<AnchorSlot, Anchor | undefined>;
      const slot = allSlots.find((s) => ea[s] === anchor);
      if (slot)
        return {
          target: el,
          targetLabel: `${section.name} › ${el.name}`,
          slot,
        };
    }
  }
  for (const trigger of pres.triggers) {
    const ta = trigger.anchors as Record<AnchorSlot, Anchor | undefined>;
    const slot = vSlots.find((s) => ta[s] === anchor);
    if (slot)
      return {
        target: trigger,
        targetLabel: trigger.name || "Trigger",
        slot,
      };
  }
  return null;
}

/** Human-readable label for a picked target object. */
function resolveTargetLabel(
  target: Element | Section | ScrollTrigger,
  pres: Presentation,
): string {
  if (isScrollTrigger(target)) return target.name || "Trigger";
  for (const section of pres.root.getSections()) {
    if (section === target) return section.name;
    for (const el of section.getElements()) {
      if (el === target) return `${section.name} › ${el.name}`;
    }
  }
  return "?";
}

/**
 * Returns the non-derived vertical position option (top or bottom) for use with
 * setAutoHeight. In the 2+1 system, exactly one of top/bottom is user-set when
 * either: (a) height is also user-set (before switching to fit-content), or
 * (b) the element is already in fit-content mode (before switching away from it).
 *
 * Returns null only in degenerate states that should not occur in a valid layout.
 */
function findVerticalPositionOption(
  element: Element,
): { top: AnchorExpression } | { bottom: AnchorExpression } | null {
  const a = element.anchors;
  if (!isDerived(a.top.expression)) return { top: a.top.expression };
  if (!isDerived(a.bottom.expression)) return { bottom: a.bottom.expression };
  return null;
}

/**
 * Returns the non-derived horizontal position option (left or right) for use
 * with setAutoWidth. Symmetric to findVerticalPositionOption.
 */
function findHorizontalPositionOption(
  element: Element,
): { left: AnchorExpression } | { right: AnchorExpression } | null {
  const a = element.anchors;
  if (!isDerived(a.left.expression)) return { left: a.left.expression };
  if (!isDerived(a.right.expression)) return { right: a.right.expression };
  return null;
}
