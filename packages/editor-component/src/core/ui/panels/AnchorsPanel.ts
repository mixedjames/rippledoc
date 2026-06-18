import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";
import type {
  Element,
  Section,
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
};

type DetailState = {
  subject: Element | Section;
  entry: AnchorEntry;
};

// The user-selectable expression types. "derived" is excluded — it is never
// something the user sets directly; it is always the third implied anchor.
type ExprType = "constant" | "offset" | "fraction";

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  subject: Element | Section,
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
  subject: Element | Section,
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
  { slot, base, exprFactory }: { slot: HSlot; base: Anchor; exprFactory: (base: Anchor) => AnchorExpression },
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
  subject: Element | Section,
  { slot, base, exprFactory }: { slot: VSlot; base: Anchor; exprFactory: (base: Anchor) => AnchorExpression },
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

// ── Panel ─────────────────────────────────────────────────────────────────────

export class AnchorsPanel implements SidebarPanel {
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;
  private detail_: DetailState | null = null;
  // Tracks the user's type selection in the detail view. Null means "use the
  // anchor's actual expression type". Set when the type dropdown changes; cleared
  // when leaving the detail view.
  private detailType_: ExprType | null = null;
  // True only on the first render after entering a detail view — drives auto-focus.
  private focusOnRender_ = false;

  // Active subscription to "anchor:picked". Cleared at the top of every
  // update() and in dispose() so stale listeners never accumulate.
  private anchorPickSub_: (() => void) | null = null;

  constructor(state: EditorState, push: PushOperation) {
    this.state_ = state;
    this.push_ = push;
    this.element = document.createElement("div");
    this.update();
  }

  update(): void {
    this.anchorPickSub_?.();
    this.anchorPickSub_ = null;
    this.element.innerHTML = "";
    const sel = this.state_.viewController?.selection;
    if (!sel) {
      this.renderEmpty_("No presentation loaded.");
      return;
    }

    const { elements, sections } = sel;
    let subject: Element | Section | null = null;
    let kind: "element" | "section" | null = null;

    if (elements.size === 1) {
      subject = [...elements][0]!;
      kind = "element";
    } else if (sections.size === 1) {
      subject = [...sections][0]!;
      kind = "section";
    }

    // Clear drill-down when the subject changes.
    if (this.detail_ && this.detail_.subject !== subject) {
      this.detail_ = null;
      this.state_.viewController?.setMode("editor");
    }

    if (!subject) {
      const multi = elements.size > 1 || sections.size > 1;
      this.renderEmpty_(
        multi
          ? "Select a single element or section to edit anchors."
          : "Select an element or section to edit anchors.",
      );
      return;
    }

    if (this.detail_) {
      this.renderDetail_(subject, this.detail_.entry);
    } else if (kind === "element") {
      this.renderElementAnchors_(subject as Element);
    } else {
      this.renderSectionAnchors_(subject as Section);
    }
  }

  dispose(): void {
    this.anchorPickSub_?.();
    this.anchorPickSub_ = null;
  }

  // ── List view ─────────────────────────────────────────────────────────────

  private renderElementAnchors_(el: Element): void {
    const a = el.anchors;
    this.renderGroup_(el, "Horizontal", [
      { name: "left", anchor: a.left, axis: "horizontal" },
      { name: "right", anchor: a.right, axis: "horizontal" },
      { name: "width", anchor: a.width, axis: "horizontal" },
    ]);
    this.renderGroup_(el, "Vertical", [
      { name: "top", anchor: a.top, axis: "vertical" },
      { name: "bottom", anchor: a.bottom, axis: "vertical" },
      { name: "height", anchor: a.height, axis: "vertical" },
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
    subject: Element | Section,
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
    subject: Element | Section,
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
      : describeExpression(entry.anchor.expression);

    row.appendChild(name);
    row.appendChild(value);
    row.appendChild(expr);

    if (!entry.locked) {
      row.addEventListener("click", () => {
        this.detail_ = { subject, entry };
        this.focusOnRender_ = true;
        this.state_.viewController?.setMode("anchors");
        this.update();
      });
    }

    return row;
  }

  // ── Detail view ───────────────────────────────────────────────────────────

  private renderDetail_(subject: Element | Section, entry: AnchorEntry): void {
    const back = document.createElement("button");
    back.className = "re-anchor-back";
    back.textContent = `← ${entry.name}`;
    back.addEventListener("click", () => {
      this.detail_ = null;
      this.detailType_ = null;
      this.state_.viewController?.setMode("editor");
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

    if (exprType === "derived") {
      this.renderSwapDerivedDropdown_(subject, entry);
      return;
    }

    const effectiveType = this.detailType_ ?? exprType;
    this.renderTypeDropdown_(effectiveType, (picked) => {
      this.detailType_ = picked;
      this.update();
    });

    if (effectiveType === "constant") {
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
          const op =
            entry.axis === "horizontal"
              ? buildHConstantOp(
                  subject as Element,
                  { slot: entry.name as HSlot, value: v },
                  () => this.update(),
                )
              : buildVConstantOp(
                  subject,
                  { slot: entry.name as VSlot, value: v },
                  () => this.update(),
                );
          this.push_(op);
        },
      });
    } else if (effectiveType === "offset") {
      if (expr instanceof OffsetAnchorExpression) {
        this.renderOffsetEdit_(subject, entry, expr);
      } else {
        this.renderAnchorPicking_(subject, entry, "offset");
      }
    } else {
      if (expr instanceof FractionAnchorExpression) {
        this.renderFractionEdit_(subject, entry, expr);
      } else {
        this.renderAnchorPicking_(subject, entry, "fraction");
      }
    }
  }

  private renderTypeDropdown_(
    current: ExprType,
    onChange: (type: ExprType) => void,
  ): void {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "type";

    const select = document.createElement("select");
    select.className = "re-style-select re-anchor-select";

    const options: Array<[ExprType, string]> = [
      ["constant", "Constant"],
      ["offset", "Anchored"],
      ["fraction", "Fraction"],
    ];
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

  private renderSwapDerivedDropdown_(
    subject: Element | Section,
    entry: AnchorEntry,
  ): void {
    // For sections, top is system-managed and must never become a free constraint,
    // so exclude it from the options the user can make derived.
    const isSection = !("setHorizontalAnchors" in subject);
    const allSlots: AnchorSlot[] =
      entry.axis === "horizontal"
        ? ["left", "right", "width"]
        : ["top", "bottom", "height"];
    const options = allSlots.filter(
      (s) => s !== entry.name && !(isSection && s === "top"),
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
              { currentDerived: entry.name as HSlot, newDerived: newDerived as HSlot },
              () => this.update(),
            )
          : buildVSwapDerivedOp(
              subject,
              { currentDerived: entry.name as VSlot, newDerived: newDerived as VSlot },
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
    subject: Element | Section,
    entry: AnchorEntry,
    type: "offset" | "fraction",
  ): void {
    const note = document.createElement("span");
    note.className = "re-panel-empty";
    note.textContent = "Click an anchor in the preview to link to it.";
    this.element.appendChild(note);

    const vc = this.state_.viewController;
    if (!vc) return;

    // isSizeSlot: width/height anchors may only reference other size anchors.
    const isSizeSlot = entry.name === "width" || entry.name === "height";

    const pres = this.state_.presentation;
    this.anchorPickSub_ = vc.events.on("anchor:picked", ({ anchor }) => {
      // Validate axis constraint: size slots only accept size anchors,
      // checked by seeing whether the picked anchor is a width or height
      // on any element/section in the presentation.
      if (isSizeSlot && (pres === null || !isSizeAnchor(anchor, pres))) return;

      const exprFactory =
        type === "offset"
          ? (base: Anchor) => new OffsetAnchorExpression(base, 0)
          : (base: Anchor) => new FractionAnchorExpression(base, 1);

      const op =
        entry.axis === "horizontal"
          ? buildHRefOp(
              subject as Element,
              { slot: entry.name as HSlot, base: anchor, exprFactory },
              () => this.update(),
            )
          : buildVRefOp(
              subject,
              { slot: entry.name as VSlot, base: anchor, exprFactory },
              () => this.update(),
            );
      this.push_(op);
    });
  }

  // ── Offset / fraction editing ─────────────────────────────────────────────

  private renderOffsetEdit_(
    subject: Element | Section,
    entry: AnchorEntry,
    expr: OffsetAnchorExpression,
  ): void {
    // OffsetAnchorExpression always constructs with exactly one dependency (base).
    const base = expr.dependencies[0]!;
    const baseRow = document.createElement("div");
    baseRow.className = "re-anchor-edit-row";
    const baseLabel = document.createElement("span");
    baseLabel.className = "re-anchor-row__name";
    baseLabel.textContent = "base";
    const baseVal = document.createElement("span");
    baseVal.className = "re-anchor-row__value";
    baseVal.textContent = fmtVal(base.value);
    baseRow.appendChild(baseLabel);
    baseRow.appendChild(baseVal);
    this.element.appendChild(baseRow);

    this.renderNumberEdit_({
      label: "offset",
      initialValue: expr.offset,
      alwaysCommit: false,
      onCommit: (v) => {
        const op =
          entry.axis === "horizontal"
            ? buildHRefOp(
                subject as Element,
                { slot: entry.name as HSlot, base, exprFactory: (b) => new OffsetAnchorExpression(b, v) },
                () => this.update(),
              )
            : buildVRefOp(
                subject,
                { slot: entry.name as VSlot, base, exprFactory: (b) => new OffsetAnchorExpression(b, v) },
                () => this.update(),
              );
        this.push_(op);
      },
    });
  }

  private renderFractionEdit_(
    subject: Element | Section,
    entry: AnchorEntry,
    expr: FractionAnchorExpression,
  ): void {
    // FractionAnchorExpression always constructs with exactly one dependency (base).
    const base = expr.dependencies[0]!;
    const baseRow = document.createElement("div");
    baseRow.className = "re-anchor-edit-row";
    const baseLabel = document.createElement("span");
    baseLabel.className = "re-anchor-row__name";
    baseLabel.textContent = "base";
    const baseVal = document.createElement("span");
    baseVal.className = "re-anchor-row__value";
    baseVal.textContent = fmtVal(base.value);
    baseRow.appendChild(baseLabel);
    baseRow.appendChild(baseVal);
    this.element.appendChild(baseRow);

    this.renderNumberEdit_({
      label: "fraction",
      initialValue: expr.fraction,
      alwaysCommit: false,
      onCommit: (v) => {
        const op =
          entry.axis === "horizontal"
            ? buildHRefOp(
                subject as Element,
                { slot: entry.name as HSlot, base, exprFactory: (b) => new FractionAnchorExpression(b, v) },
                () => this.update(),
              )
            : buildVRefOp(
                subject,
                { slot: entry.name as VSlot, base, exprFactory: (b) => new FractionAnchorExpression(b, v) },
                () => this.update(),
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

/** Returns true if `anchor` is a width or height anchor of any object in the presentation. */
function isSizeAnchor(anchor: Anchor, pres: Presentation): boolean {
  for (const section of pres.root.getSections()) {
    if (section.anchors.width === anchor || section.anchors.height === anchor)
      return true;
    for (const element of section.getElements()) {
      if (element.anchors.width === anchor || element.anchors.height === anchor)
        return true;
    }
  }
  return false;
}
