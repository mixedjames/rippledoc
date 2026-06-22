import type {
  Color,
  Fill,
  Border,
  BorderEdgeStyle,
  StyleValue,
  FontWeight,
  ElementStyleProps,
  SectionStyleProps,
  StyleRegistry,
} from "@rippledoc/presentation4";
import type { DialogResult } from "../../clientAPI/DialogResult";
import type { OperationSink } from "../../clientAPI/OperationSink";
import type { DialogHost } from "../infrastructure/DialogHost";

// ── Color utilities ───────────────────────────────────────────────────────────

const HEX_RADIX = 16;
const HEX_R_OFFSET = 1;
const HEX_CHANNEL_WIDTH = 2;
const HEX_G_OFFSET = HEX_R_OFFSET + HEX_CHANNEL_WIDTH;
const HEX_B_OFFSET = HEX_G_OFFSET + HEX_CHANNEL_WIDTH;

function colorToHex(c: Color): string {
  const ch = (n: number): string =>
    Math.round(n).toString(HEX_RADIX).padStart(HEX_CHANNEL_WIDTH, "0");
  return `#${ch(c.r)}${ch(c.g)}${ch(c.b)}`;
}

function hexAlphaToColor(hex: string, alphaPct: number): Color {
  return {
    r: parseInt(hex.slice(HEX_R_OFFSET, HEX_R_OFFSET + HEX_CHANNEL_WIDTH), HEX_RADIX),
    g: parseInt(hex.slice(HEX_G_OFFSET, HEX_G_OFFSET + HEX_CHANNEL_WIDTH), HEX_RADIX),
    b: parseInt(hex.slice(HEX_B_OFFSET, HEX_B_OFFSET + HEX_CHANNEL_WIDTH), HEX_RADIX),
    a: alphaPct / 100,
  };
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function makeUnsetBtn(onClick: () => void): HTMLElement {
  const wrap = el("div");
  const btn = el("button", "rdoc-dlg-unset-btn");
  btn.textContent = "—";
  btn.addEventListener("click", onClick);
  wrap.appendChild(btn);
  return wrap;
}

function makeClearBtn(onClick: () => void): HTMLButtonElement {
  const btn = el("button", "rdoc-dlg-clear");
  btn.textContent = "×";
  btn.title = "Clear";
  btn.addEventListener("click", onClick);
  return btn;
}

// ── Inline colour inputs ──────────────────────────────────────────────────────
//
// Used inside FillControl and BorderControl where a colour is always required
// once the type is set — no unset state, no nested clear button.

function makeColorInputs(initial: Color): { element: HTMLElement; getValue: () => Color } {
  const hexInput = el("input", "rdoc-dlg-input");
  hexInput.type = "color";
  hexInput.value = colorToHex(initial);

  const alphaInput = el("input", "rdoc-dlg-input rdoc-dlg-input--num");
  alphaInput.type = "number";
  alphaInput.min = "0";
  alphaInput.max = "100";
  alphaInput.step = "1";
  alphaInput.value = String(Math.round(initial.a * 100));

  const alphaLabel = el("span", "rdoc-dlg-unit");
  alphaLabel.textContent = "%";

  const element = el("div", "rdoc-dlg-group");
  element.append(hexInput, alphaInput, alphaLabel);

  return {
    element,
    getValue: () => hexAlphaToColor(hexInput.value, parseFloat(alphaInput.value)),
  };
}

// ── ColorControl ──────────────────────────────────────────────────────────────

const DEFAULT_COLOR: Color = { r: 0, g: 0, b: 0, a: 1 };

class ColorControl {
  readonly element: HTMLElement;
  private active_: boolean;
  private readonly hexInput_: HTMLInputElement;
  private readonly alphaInput_: HTMLInputElement;
  private readonly unsetView_: HTMLElement;
  private readonly setView_: HTMLElement;

  constructor(initial: Color | undefined) {
    this.active_ = initial !== undefined;
    const color = initial ?? DEFAULT_COLOR;

    this.hexInput_ = el("input", "rdoc-dlg-input");
    this.hexInput_.type = "color";
    this.hexInput_.value = colorToHex(color);

    this.alphaInput_ = el("input", "rdoc-dlg-input rdoc-dlg-input--num");
    this.alphaInput_.type = "number";
    this.alphaInput_.min = "0";
    this.alphaInput_.max = "100";
    this.alphaInput_.step = "1";
    this.alphaInput_.value = String(Math.round(color.a * 100));

    const alphaLabel = el("span", "rdoc-dlg-unit");
    alphaLabel.textContent = "%";

    this.setView_ = el("div", "rdoc-dlg-group");
    this.setView_.append(this.hexInput_, this.alphaInput_, alphaLabel, makeClearBtn(() => this.onClear_()));

    this.unsetView_ = makeUnsetBtn(() => this.onActivate_());

    this.element = el("div", "rdoc-dlg-group");
    this.element.append(this.unsetView_, this.setView_);

    this.updateView_();
  }

  getValue(): Color | undefined {
    if (!this.active_) return undefined;
    return hexAlphaToColor(this.hexInput_.value, parseFloat(this.alphaInput_.value));
  }

  private onActivate_(): void {
    this.active_ = true;
    this.updateView_();
  }

  private onClear_(): void {
    this.active_ = false;
    this.updateView_();
  }

  private updateView_(): void {
    this.unsetView_.style.display = this.active_ ? "none" : "";
    this.setView_.style.display = this.active_ ? "" : "none";
  }
}

// ── FillControl ───────────────────────────────────────────────────────────────

const DEFAULT_FILL_COLOR: Color = { r: 255, g: 255, b: 255, a: 1 };

class FillControl {
  readonly element: HTMLElement;
  private type_: "unset" | "none" | "solid";
  private readonly typeSelect_: HTMLSelectElement;
  private readonly colorInputs_: { element: HTMLElement; getValue: () => Color };
  private readonly unsetView_: HTMLElement;
  private readonly setView_: HTMLElement;

  constructor(initial: Fill | undefined) {
    this.type_ = initial === undefined ? "unset" : initial.type;
    const initColor = initial?.type === "solid" ? initial.color : DEFAULT_FILL_COLOR;

    this.colorInputs_ = makeColorInputs(initColor);

    this.typeSelect_ = el("select", "rdoc-dlg-select");
    this.typeSelect_.append(new Option("None", "none"), new Option("Solid", "solid"));
    this.typeSelect_.value = this.type_ === "solid" ? "solid" : "none";
    this.typeSelect_.addEventListener("change", () => this.onTypeChange_());

    this.setView_ = el("div", "rdoc-dlg-group");
    this.setView_.append(this.typeSelect_, this.colorInputs_.element, makeClearBtn(() => this.onClear_()));

    this.unsetView_ = makeUnsetBtn(() => this.onActivate_());

    this.element = el("div", "rdoc-dlg-group");
    this.element.append(this.unsetView_, this.setView_);

    this.updateView_();
  }

  getValue(): Fill | undefined {
    if (this.type_ === "unset") return undefined;
    if (this.type_ === "none") return { type: "none" };
    return { type: "solid", color: this.colorInputs_.getValue() };
  }

  private onActivate_(): void {
    this.type_ = "solid";
    this.typeSelect_.value = "solid";
    this.updateView_();
  }

  private onClear_(): void {
    this.type_ = "unset";
    this.updateView_();
  }

  private onTypeChange_(): void {
    this.type_ = this.typeSelect_.value === "solid" ? "solid" : "none";
    this.updateView_();
  }

  private updateView_(): void {
    const isUnset = this.type_ === "unset";
    this.unsetView_.style.display = isUnset ? "" : "none";
    this.setView_.style.display = isUnset ? "none" : "";
    this.colorInputs_.element.style.display = this.type_ === "solid" ? "" : "none";
  }
}

// ── BorderControl ─────────────────────────────────────────────────────────────

const DEFAULT_BORDER_COLOR: Color = { r: 0, g: 0, b: 0, a: 1 };
const BORDER_EDGE_STYLES: BorderEdgeStyle[] = ["solid", "dashed", "dotted"];

class BorderControl {
  readonly element: HTMLElement;
  private type_: "unset" | "none" | "border";
  private readonly typeSelect_: HTMLSelectElement;
  private readonly widthInput_: HTMLInputElement;
  private readonly styleSelect_: HTMLSelectElement;
  private readonly colorInputs_: { element: HTMLElement; getValue: () => Color };
  private readonly details_: HTMLElement;
  private readonly unsetView_: HTMLElement;
  private readonly setView_: HTMLElement;

  constructor(initial: Border | undefined) {
    this.type_ = initial === undefined ? "unset" : initial.type;
    const initWidth = initial?.type === "border" ? initial.width.value : 1;
    const initStyle = initial?.type === "border" ? initial.style : "solid";
    const initColor = initial?.type === "border" ? initial.color : DEFAULT_BORDER_COLOR;

    this.colorInputs_ = makeColorInputs(initColor);

    this.widthInput_ = el("input", "rdoc-dlg-input rdoc-dlg-input--num");
    this.widthInput_.type = "number";
    this.widthInput_.min = "0";
    this.widthInput_.step = "1";
    this.widthInput_.value = String(initWidth);

    this.styleSelect_ = el("select", "rdoc-dlg-select");
    for (const s of BORDER_EDGE_STYLES) {
      const opt = new Option(s, s);
      if (s === initStyle) opt.selected = true;
      this.styleSelect_.appendChild(opt);
    }

    this.typeSelect_ = el("select", "rdoc-dlg-select");
    this.typeSelect_.append(new Option("None", "none"), new Option("Border", "border"));
    this.typeSelect_.value = this.type_ === "border" ? "border" : "none";
    this.typeSelect_.addEventListener("change", () => this.onTypeChange_());

    this.details_ = el("div", "rdoc-dlg-group");
    this.details_.append(this.widthInput_, this.styleSelect_, this.colorInputs_.element);

    this.setView_ = el("div", "rdoc-dlg-group");
    this.setView_.append(this.typeSelect_, this.details_, makeClearBtn(() => this.onClear_()));

    this.unsetView_ = makeUnsetBtn(() => this.onActivate_());

    this.element = el("div", "rdoc-dlg-group");
    this.element.append(this.unsetView_, this.setView_);

    this.updateView_();
  }

  getValue(): Border | undefined {
    if (this.type_ === "unset") return undefined;
    if (this.type_ === "none") return { type: "none" };
    const width: StyleValue = { unit: "basis", value: parseFloat(this.widthInput_.value) || 1 };
    const style = this.styleSelect_.value as BorderEdgeStyle;
    return { type: "border", width, style, color: this.colorInputs_.getValue() };
  }

  private onActivate_(): void {
    this.type_ = "border";
    this.typeSelect_.value = "border";
    this.updateView_();
  }

  private onClear_(): void {
    this.type_ = "unset";
    this.updateView_();
  }

  private onTypeChange_(): void {
    this.type_ = this.typeSelect_.value === "border" ? "border" : "none";
    this.updateView_();
  }

  private updateView_(): void {
    const isUnset = this.type_ === "unset";
    this.unsetView_.style.display = isUnset ? "" : "none";
    this.setView_.style.display = isUnset ? "none" : "";
    this.details_.style.display = this.type_ === "border" ? "" : "none";
  }
}

// ── FontFamilyControl ─────────────────────────────────────────────────────────

class FontFamilyControl {
  readonly element: HTMLElement;
  private active_: boolean;
  private readonly input_: HTMLInputElement;
  private readonly unsetView_: HTMLElement;
  private readonly setView_: HTMLElement;

  constructor(initial: string | undefined) {
    this.active_ = initial !== undefined;

    this.input_ = el("input", "rdoc-dlg-input rdoc-dlg-input--text");
    this.input_.type = "text";
    this.input_.value = initial ?? "";
    this.input_.placeholder = "e.g. sans-serif";

    this.setView_ = el("div", "rdoc-dlg-group");
    this.setView_.append(this.input_, makeClearBtn(() => this.onClear_()));

    this.unsetView_ = makeUnsetBtn(() => this.onActivate_());

    this.element = el("div", "rdoc-dlg-group");
    this.element.append(this.unsetView_, this.setView_);

    this.updateView_();
  }

  getValue(): string | undefined {
    return this.active_ ? (this.input_.value || undefined) : undefined;
  }

  private onActivate_(): void {
    this.active_ = true;
    this.updateView_();
    this.input_.focus();
  }

  private onClear_(): void {
    this.active_ = false;
    this.updateView_();
  }

  private updateView_(): void {
    this.unsetView_.style.display = this.active_ ? "none" : "";
    this.setView_.style.display = this.active_ ? "" : "none";
  }
}

// ── FontSizeControl ───────────────────────────────────────────────────────────

const DEFAULT_FONT_SIZE = 24;

class FontSizeControl {
  readonly element: HTMLElement;
  private active_: boolean;
  private readonly input_: HTMLInputElement;
  private readonly unsetView_: HTMLElement;
  private readonly setView_: HTMLElement;

  constructor(initial: StyleValue | undefined) {
    this.active_ = initial !== undefined;

    this.input_ = el("input", "rdoc-dlg-input rdoc-dlg-input--num");
    this.input_.type = "number";
    this.input_.min = "1";
    this.input_.step = "1";
    this.input_.value = String(initial?.value ?? DEFAULT_FONT_SIZE);

    const unit = el("span", "rdoc-dlg-unit");
    unit.textContent = "basis";

    this.setView_ = el("div", "rdoc-dlg-group");
    this.setView_.append(this.input_, unit, makeClearBtn(() => this.onClear_()));

    this.unsetView_ = makeUnsetBtn(() => this.onActivate_());

    this.element = el("div", "rdoc-dlg-group");
    this.element.append(this.unsetView_, this.setView_);

    this.updateView_();
  }

  getValue(): StyleValue | undefined {
    if (!this.active_) return undefined;
    const v = parseFloat(this.input_.value);
    if (isNaN(v) || v <= 0) return undefined;
    return { unit: "basis", value: v };
  }

  private onActivate_(): void {
    this.active_ = true;
    this.updateView_();
    this.input_.focus();
  }

  private onClear_(): void {
    this.active_ = false;
    this.updateView_();
  }

  private updateView_(): void {
    this.unsetView_.style.display = this.active_ ? "none" : "";
    this.setView_.style.display = this.active_ ? "" : "none";
  }
}

// ── FontWeightControl ─────────────────────────────────────────────────────────

// eslint-disable-next-line no-magic-numbers
const FONT_WEIGHTS: FontWeight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const DEFAULT_FONT_WEIGHT: FontWeight = 400;

class FontWeightControl {
  readonly element: HTMLElement;
  private active_: boolean;
  private readonly select_: HTMLSelectElement;
  private readonly unsetView_: HTMLElement;
  private readonly setView_: HTMLElement;

  constructor(initial: FontWeight | undefined) {
    this.active_ = initial !== undefined;

    this.select_ = el("select", "rdoc-dlg-select");
    for (const w of FONT_WEIGHTS) {
      const opt = new Option(String(w), String(w));
      if (w === (initial ?? DEFAULT_FONT_WEIGHT)) opt.selected = true;
      this.select_.appendChild(opt);
    }

    this.setView_ = el("div", "rdoc-dlg-group");
    this.setView_.append(this.select_, makeClearBtn(() => this.onClear_()));

    this.unsetView_ = makeUnsetBtn(() => this.onActivate_());

    this.element = el("div", "rdoc-dlg-group");
    this.element.append(this.unsetView_, this.setView_);

    this.updateView_();
  }

  getValue(): FontWeight | undefined {
    return this.active_ ? (Number(this.select_.value) as FontWeight) : undefined;
  }

  private onActivate_(): void {
    this.active_ = true;
    this.updateView_();
  }

  private onClear_(): void {
    this.active_ = false;
    this.updateView_();
  }

  private updateView_(): void {
    this.unsetView_.style.display = this.active_ ? "none" : "";
    this.setView_.style.display = this.active_ ? "" : "none";
  }
}

// ── FontItalicControl ─────────────────────────────────────────────────────────

class FontItalicControl {
  readonly element: HTMLElement;
  private value_: boolean | undefined;
  private readonly italicBtn_: HTMLButtonElement;
  private readonly normalBtn_: HTMLButtonElement;
  private readonly unsetView_: HTMLElement;
  private readonly setView_: HTMLElement;

  constructor(initial: boolean | undefined) {
    this.value_ = initial;

    this.italicBtn_ = el("button", "rdoc-dlg-toggle-btn");
    this.italicBtn_.textContent = "Italic";
    this.italicBtn_.addEventListener("click", () => this.setValue_(true));

    this.normalBtn_ = el("button", "rdoc-dlg-toggle-btn");
    this.normalBtn_.textContent = "Normal";
    this.normalBtn_.addEventListener("click", () => this.setValue_(false));

    const toggle = el("div", "rdoc-dlg-toggle");
    toggle.append(this.italicBtn_, this.normalBtn_);

    this.setView_ = el("div", "rdoc-dlg-group");
    this.setView_.append(toggle, makeClearBtn(() => this.onClear_()));

    this.unsetView_ = makeUnsetBtn(() => this.onActivate_());

    this.element = el("div", "rdoc-dlg-group");
    this.element.append(this.unsetView_, this.setView_);

    this.updateView_();
  }

  getValue(): boolean | undefined {
    return this.value_;
  }

  private setValue_(v: boolean): void {
    this.value_ = v;
    this.updateToggleState_();
  }

  private onActivate_(): void {
    this.value_ = false;
    this.updateView_();
  }

  private onClear_(): void {
    this.value_ = undefined;
    this.updateView_();
  }

  private updateView_(): void {
    this.unsetView_.style.display = this.value_ === undefined ? "" : "none";
    this.setView_.style.display = this.value_ === undefined ? "none" : "";
    this.updateToggleState_();
  }

  private updateToggleState_(): void {
    this.italicBtn_.classList.toggle("rdoc-dlg-toggle-btn--active", this.value_ === true);
    this.normalBtn_.classList.toggle("rdoc-dlg-toggle-btn--active", this.value_ === false);
  }
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function buildRow(label: string, control: HTMLElement): HTMLElement {
  const row = el("div", "rdoc-dlg-row");
  const lbl = el("span", "rdoc-dlg-row-label");
  lbl.textContent = label;
  const wrap = el("div", "rdoc-dlg-row-control");
  wrap.appendChild(control);
  row.append(lbl, wrap);
  return row;
}

function buildSection(title: string, rows: HTMLElement[]): HTMLElement {
  const section = el("div", "rdoc-dlg-section");
  const heading = el("p", "rdoc-dlg-section-title");
  heading.textContent = title;
  section.appendChild(heading);
  for (const row of rows) section.appendChild(row);
  return section;
}

function buildHeader(title: string): HTMLElement {
  const header = el("div", "rdoc-dlg-header");
  const h = el("h2", "rdoc-dlg-title");
  h.textContent = title;
  header.appendChild(h);
  return header;
}

function buildFooter(onCancel: () => void, onCommit: () => void): HTMLElement {
  const footer = el("div", "rdoc-dlg-footer");

  const cancelBtn = el("button", "rdoc-dlg-btn rdoc-dlg-btn--cancel");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", onCancel);

  const commitBtn = el("button", "rdoc-dlg-btn rdoc-dlg-btn--commit");
  commitBtn.textContent = "Apply";
  commitBtn.addEventListener("click", onCommit);

  footer.append(cancelBtn, commitBtn);
  return footer;
}

// ── Dialog content ────────────────────────────────────────────────────────────

function buildContent(
  styles: StyleRegistry,
  sink: OperationSink,
  close: (result: DialogResult<void>) => void,
): { element: HTMLElement; onDismiss(): void } {
  const snapshot = {
    element: { ...styles.globalElementStyle },
    section: { ...styles.globalSectionStyle },
  };
  const es = snapshot.element;
  const ss = snapshot.section;

  const eFill = new FillControl(es.fill);
  const eBorder = new BorderControl(es.border);
  const eFontFamily = new FontFamilyControl(es.fontFamily);
  const eFontSize = new FontSizeControl(es.fontSize);
  const eFontWeight = new FontWeightControl(es.fontWeight);
  const eFontColor = new ColorControl(es.fontColor);
  const eFontItalic = new FontItalicControl(es.fontItalic);
  const sFill = new FillControl(ss.fill);
  const sBorder = new BorderControl(ss.border);

  const onDismiss = (): void => close({ committed: false });

  const onCommit = (): void => {
    const newElement: ElementStyleProps = {
      fill: eFill.getValue(),
      border: eBorder.getValue(),
      fontFamily: eFontFamily.getValue(),
      fontSize: eFontSize.getValue(),
      fontWeight: eFontWeight.getValue(),
      fontColor: eFontColor.getValue(),
      fontItalic: eFontItalic.getValue(),
    };
    const newSection: SectionStyleProps = {
      fill: sFill.getValue(),
      border: sBorder.getValue(),
    };

    const op = {
      execute: (): void => {
        styles.setGlobalElementStyle(newElement);
        styles.setGlobalSectionStyle(newSection);
      },
      undo: (): void => {
        styles.setGlobalElementStyle(snapshot.element);
        styles.setGlobalSectionStyle(snapshot.section);
      },
    };
    op.execute();
    sink.push(op);

    close({ committed: true, value: undefined });
  };

  const body = el("div", "rdoc-dlg-body");
  body.append(
    buildSection("Elements", [
      buildRow("Fill", eFill.element),
      buildRow("Border", eBorder.element),
      buildRow("Family", eFontFamily.element),
      buildRow("Size", eFontSize.element),
      buildRow("Weight", eFontWeight.element),
      buildRow("Color", eFontColor.element),
      buildRow("Italic", eFontItalic.element),
    ]),
    buildSection("Sections", [
      buildRow("Fill", sFill.element),
      buildRow("Border", sBorder.element),
    ]),
  );

  const dialog = el("div");
  dialog.append(buildHeader("Global Styles"), body, buildFooter(onDismiss, onCommit));

  return { element: dialog, onDismiss };
}

// ── Public entry point ────────────────────────────────────────────────────────

export function openGlobalStylesDialog(
  host: DialogHost,
  styles: StyleRegistry,
  sink: OperationSink,
): Promise<DialogResult<void>> {
  return host.show<DialogResult<void>>((close) => buildContent(styles, sink, close));
}
