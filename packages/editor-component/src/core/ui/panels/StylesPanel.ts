import type {
  Element,
  Section,
  MarkdownElement,
  Color,
  Fill,
  Border,
  BorderEdgeStyle,
  ComputedBorder,
  ComputedElementStyle,
  FontWeight,
  ElementStyleProps,
  SectionStyleProps,
} from "@rippledoc/presentation4";
import type { EditOperation } from "../../history/EditOperation";
import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";
import { colorToHex, hexToColor, colorToAlphaPct } from "../widgets/colorUtils";

// ── Types ────────────────────────────────────────────────────────────────────

interface FontConsensus {
  /** null = mixed (elements have different values for this property) */
  family: string | null;
  /** Computed font size in basis units; null = mixed. The unit selector defaults to "basis".
   * TODO: pre-select unit from element.styles.own.fontSize when present. */
  size: number | "mixed";
  weight: FontWeight | "mixed";
  color: Color | "mixed";
  italic: boolean | "mixed";
}

// ── Constants ─────────────────────────────────────────────────────────────────

/* eslint-disable no-magic-numbers */
const FONT_WEIGHTS: readonly FontWeight[] = [
  100, 200, 300, 400, 500, 600, 700, 800, 900,
];
/* eslint-enable no-magic-numbers */

// ── Equality helpers ──────────────────────────────────────────────────────────

function colorsEqual(a: Color, b: Color): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function fillsEqual(a: Fill, b: Fill): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "solid" && b.type === "solid")
    return colorsEqual(a.color, b.color);
  return true;
}

function bordersEqual(a: ComputedBorder, b: ComputedBorder): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "border" && b.type === "border") {
    return (
      a.width === b.width &&
      a.style === b.style &&
      colorsEqual(a.color, b.color)
    );
  }
  return true;
}

// ── Consensus helpers ─────────────────────────────────────────────────────────

function consensusFill(fills: Fill[]): Fill | "mixed" {
  const first = fills[0]!;
  return fills.every((f) => fillsEqual(f, first)) ? first : "mixed";
}

function consensusBorder(borders: ComputedBorder[]): ComputedBorder | "mixed" {
  const first = borders[0]!;
  return borders.every((b) => bordersEqual(b, first)) ? first : "mixed";
}

function consensusFont(styles: ComputedElementStyle[]): FontConsensus {
  const first = styles[0]!;
  return {
    family: styles.every((s) => s.fontFamily === first.fontFamily)
      ? first.fontFamily
      : null,
    size: styles.every((s) => s.fontSize === first.fontSize)
      ? first.fontSize
      : "mixed",
    weight: styles.every((s) => s.fontWeight === first.fontWeight)
      ? first.fontWeight
      : "mixed",
    color: styles.every((s) => colorsEqual(s.fontColor, first.fontColor))
      ? first.fontColor
      : "mixed",
    italic: styles.every((s) => s.fontItalic === first.fontItalic)
      ? first.fontItalic
      : "mixed",
  };
}

// ── Type guard ────────────────────────────────────────────────────────────────

function isMarkdown(el: Element): el is MarkdownElement {
  return "markdown" in el;
}

// ── Operation factories ───────────────────────────────────────────────────────

function makeElementStyleOp(
  elements: ReadonlySet<Element>,
  patch: ElementStyleProps,
): EditOperation {
  const snapshots = new Map([...elements].map((el) => [el, el.styles.own]));
  return {
    execute() {
      for (const el of elements) {
        el.styles.set({ ...snapshots.get(el), ...patch });
      }
    },
    undo() {
      for (const el of elements) {
        el.styles.set(snapshots.get(el)!);
      }
    },
  };
}

function makeSectionStyleOp(
  sections: ReadonlySet<Section>,
  patch: SectionStyleProps,
): EditOperation {
  const snapshots = new Map([...sections].map((s) => [s, s.styles.own]));
  return {
    execute() {
      for (const s of sections) {
        s.styles.set({ ...snapshots.get(s), ...patch });
      }
    },
    undo() {
      for (const s of sections) {
        s.styles.set(snapshots.get(s)!);
      }
    },
  };
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export class StylesPanel implements SidebarPanel {
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;

  constructor(state: EditorState, push: PushOperation) {
    this.state_ = state;
    this.push_ = push;
    this.element = document.createElement("div");
    this.update();
  }

  update(): void {
    this.element.innerHTML = "";
    const { elements, sections } = this.state_.viewController.selection;
    if (elements.size > 0) {
      this.renderElementStyles_(elements);
    } else if (sections.size > 0) {
      this.renderSectionStyles_(sections);
    } else {
      this.renderEmpty_("Select elements or sections to edit styles.");
    }
  }

  dispose(): void {}

  // ── Top-level renderers ───────────────────────────────────────────────────

  private renderEmpty_(message: string): void {
    const msg = document.createElement("span");
    msg.className = "re-panel-empty";
    msg.textContent = message;
    this.element.appendChild(msg);
  }

  private renderElementStyles_(elements: ReadonlySet<Element>): void {
    const styles = [...elements].map((el) => el.styles.computed);
    const markdownEls = [...elements].filter(isMarkdown);

    const fill = consensusFill(styles.map((s) => s.fill));
    this.renderFillSection_(fill, (f) => {
      this.push_(makeElementStyleOp(elements, { fill: f }));
      this.update();
    });

    const border = consensusBorder(styles.map((s) => s.border));
    this.renderBorderSection_(border, (b) => {
      this.push_(makeElementStyleOp(elements, { border: b }));
      this.update();
    });

    if (markdownEls.length > 0) {
      const mdStyles = markdownEls.map((el) => el.styles.computed);
      const font = consensusFont(mdStyles);
      const mdSet = new Set<Element>(markdownEls);
      this.renderFontSection_(font, (patch) => {
        this.push_(makeElementStyleOp(mdSet, patch));
        this.update();
      });
    }
  }

  private renderSectionStyles_(sections: ReadonlySet<Section>): void {
    const styles = [...sections].map((s) => s.styles.computed);

    const fill = consensusFill(styles.map((s) => s.fill));
    this.renderFillSection_(fill, (f) => {
      this.push_(makeSectionStyleOp(sections, { fill: f }));
      this.update();
    });

    const border = consensusBorder(styles.map((s) => s.border));
    this.renderBorderSection_(border, (b) => {
      this.push_(makeSectionStyleOp(sections, { border: b }));
      this.update();
    });
  }

  // ── Section renderers ─────────────────────────────────────────────────────

  private renderFillSection_(
    fill: Fill | "mixed",
    onChange: (fill: Fill) => void,
  ): void {
    const { section, body } = this.createSection_("Fill");
    this.element.appendChild(section);

    const isMixed = fill === "mixed";
    const typeOpts = isMixed
      ? [
          { value: "mixed", label: "—" },
          { value: "none", label: "None" },
          { value: "solid", label: "Solid" },
        ]
      : [
          { value: "none", label: "None" },
          { value: "solid", label: "Solid" },
        ];
    const { row: typeRow, value: typeValue } = this.createRow_("Type");
    const typeSelect = this.createSelect_(
      typeOpts,
      isMixed ? "mixed" : fill.type,
    );
    typeValue.appendChild(typeSelect);
    body.appendChild(typeRow);

    if (!isMixed && fill.type === "solid") {
      const currentColor = fill.color;
      body.appendChild(
        this.createColorRow_("Color", currentColor, (color) => {
          onChange({ type: "solid", color });
        }),
      );
    }

    // v1: no "unset to inherited" — only None or Solid can be set.
    typeSelect.addEventListener("change", () => {
      const newType = typeSelect.value as "none" | "solid" | "mixed";
      if (newType === "mixed") return;
      if (newType === "none") {
        onChange({ type: "none" });
      } else {
        const defaultColor =
          !isMixed && fill.type === "solid"
            ? fill.color
            : { r: 255, g: 255, b: 255, a: 1 };
        onChange({ type: "solid", color: defaultColor });
      }
    });
  }

  private renderBorderSection_(
    border: ComputedBorder | "mixed",
    onChange: (b: Border) => void,
  ): void {
    const { section, body } = this.createSection_("Border");
    this.element.appendChild(section);

    const isMixed = border === "mixed";
    const typeOpts = isMixed
      ? [
          { value: "mixed", label: "—" },
          { value: "none", label: "None" },
          { value: "border", label: "Border" },
        ]
      : [
          { value: "none", label: "None" },
          { value: "border", label: "Border" },
        ];
    const { row: typeRow, value: typeValue } = this.createRow_("Type");
    const typeSelect = this.createSelect_(
      typeOpts,
      isMixed ? "mixed" : border.type,
    );
    typeValue.appendChild(typeSelect);
    body.appendChild(typeRow);

    if (!isMixed && border.type === "border") {
      // Capture narrowed values for use in closures.
      const bWidth = border.width;
      const bStyle = border.style;
      const bColor = border.color;

      const { row: widthRow, value: widthValue } = this.createRow_("Width");
      const widthInput = document.createElement("input");
      widthInput.type = "number";
      widthInput.className = "re-style-input re-style-input--number";
      widthInput.value = String(bWidth);
      widthInput.min = "0";
      widthValue.appendChild(widthInput);
      widthValue.appendChild(document.createTextNode(" basis"));
      body.appendChild(widthRow);

      const { row: styleRow, value: styleValue } = this.createRow_("Style");
      const styleSelect = this.createSelect_(
        [
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" },
        ],
        bStyle,
      );
      styleValue.appendChild(styleSelect);
      body.appendChild(styleRow);

      body.appendChild(
        this.createColorRow_("Color", bColor, (color) => {
          onChange({
            type: "border",
            width: { unit: "basis", value: bWidth },
            style: bStyle,
            color,
          });
        }),
      );

      widthInput.addEventListener("change", () => {
        const w = parseFloat(widthInput.value);
        if (isNaN(w) || w < 0) return;
        onChange({
          type: "border",
          width: { unit: "basis", value: w },
          style: styleSelect.value as BorderEdgeStyle,
          color: bColor,
        });
      });
      styleSelect.addEventListener("change", () => {
        onChange({
          type: "border",
          width: { unit: "basis", value: bWidth },
          style: styleSelect.value as BorderEdgeStyle,
          color: bColor,
        });
      });
    }

    // v1: no "unset to inherited" — only None or Border can be set.
    typeSelect.addEventListener("change", () => {
      const newType = typeSelect.value as "none" | "border" | "mixed";
      if (newType === "mixed") return;
      if (newType === "none") {
        onChange({ type: "none" });
      } else {
        const defaultColor =
          !isMixed && border.type === "border"
            ? border.color
            : { r: 0, g: 0, b: 0, a: 1 };
        const defaultWidth =
          !isMixed && border.type === "border" ? border.width : 1;
        onChange({
          type: "border",
          width: { unit: "basis", value: defaultWidth },
          style: "solid",
          color: defaultColor,
        });
      }
    });
  }

  private renderFontSection_(
    font: FontConsensus,
    onChange: (patch: ElementStyleProps) => void,
  ): void {
    const { section, body } = this.createSection_("Font");
    this.element.appendChild(section);

    // Family
    const { row: familyRow, value: familyValue } = this.createRow_("Family");
    const familyInput = document.createElement("input");
    familyInput.type = "text";
    familyInput.className = "re-style-input re-style-input--text";
    if (font.family === null) {
      familyInput.placeholder = "—";
    } else {
      familyInput.value = font.family;
    }
    familyInput.addEventListener("change", () => {
      const v = familyInput.value.trim();
      if (v) onChange({ fontFamily: v });
    });
    familyValue.appendChild(familyInput);
    body.appendChild(familyRow);

    // Size — displays computed (basis) value; unit selector applies on write.
    // TODO: pre-select unit from element.styles.own.fontSize when present.
    const { row: sizeRow, value: sizeValue } = this.createRow_("Size");
    const sizeInput = document.createElement("input");
    sizeInput.type = "number";
    sizeInput.className = "re-style-input re-style-input--number";
    sizeInput.min = "0";
    if (font.size === "mixed") {
      sizeInput.placeholder = "—";
    } else {
      sizeInput.value = String(font.size);
    }
    const unitSelect = this.createSelect_(
      [
        { value: "basis", label: "basis" },
        { value: "relative", label: "relative" },
      ],
      "basis",
    );
    const commitSize = () => {
      const v = parseFloat(sizeInput.value);
      if (isNaN(v) || v <= 0) return;
      const unit = unitSelect.value as "basis" | "relative";
      onChange({ fontSize: { unit, value: v } });
    };
    sizeInput.addEventListener("change", commitSize);
    unitSelect.addEventListener("change", commitSize);
    sizeValue.appendChild(sizeInput);
    sizeValue.appendChild(unitSelect);
    body.appendChild(sizeRow);

    // Weight
    const { row: weightRow, value: weightValue } = this.createRow_("Weight");
    const weightOpts =
      font.weight === "mixed"
        ? [
            { value: "", label: "—" },
            ...FONT_WEIGHTS.map((w) => ({
              value: String(w),
              label: String(w),
            })),
          ]
        : FONT_WEIGHTS.map((w) => ({ value: String(w), label: String(w) }));
    const weightSelect = this.createSelect_(
      weightOpts,
      font.weight === "mixed" ? "" : String(font.weight),
    );
    weightSelect.addEventListener("change", () => {
      const parsed = Number(weightSelect.value);
      if (parsed > 0) onChange({ fontWeight: parsed as FontWeight });
    });
    weightValue.appendChild(weightSelect);
    body.appendChild(weightRow);

    // Color
    body.appendChild(
      this.createColorRow_(
        "Color",
        font.color === "mixed" ? "mixed" : font.color,
        (color) => {
          onChange({ fontColor: color });
        },
      ),
    );

    // Italic
    const { row: italicRow, value: italicValue } = this.createRow_("Italic");
    const italicCheck = document.createElement("input");
    italicCheck.type = "checkbox";
    italicCheck.className = "re-style-check";
    if (font.italic === "mixed") {
      italicCheck.indeterminate = true;
    } else {
      italicCheck.checked = font.italic;
    }
    italicCheck.addEventListener("change", () => {
      onChange({ fontItalic: italicCheck.checked });
    });
    italicValue.appendChild(italicCheck);
    body.appendChild(italicRow);
  }

  // ── Widget helpers ────────────────────────────────────────────────────────

  private createSection_(title: string): {
    section: HTMLElement;
    body: HTMLElement;
  } {
    const section = document.createElement("div");
    section.className = "re-style-section";
    const titleEl = document.createElement("div");
    titleEl.className = "re-style-section__title";
    titleEl.textContent = title;
    const body = document.createElement("div");
    body.className = "re-style-section__body";
    section.appendChild(titleEl);
    section.appendChild(body);
    return { section, body };
  }

  private createRow_(label: string): {
    row: HTMLElement;
    value: HTMLElement;
  } {
    const row = document.createElement("div");
    row.className = "re-style-row";
    const lbl = document.createElement("span");
    lbl.className = "re-style-row__label";
    lbl.textContent = label;
    const val = document.createElement("div");
    val.className = "re-style-row__value";
    row.appendChild(lbl);
    row.appendChild(val);
    return { row, value: val };
  }

  private createSelect_(
    options: readonly { value: string; label: string }[],
    selectedValue: string,
  ): HTMLSelectElement {
    const sel = document.createElement("select");
    sel.className = "re-style-select";
    for (const { value, label } of options) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      if (value === selectedValue) opt.selected = true;
      sel.appendChild(opt);
    }
    return sel;
  }

  private createColorRow_(
    label: string,
    color: Color | "mixed",
    onChange: (c: Color) => void,
  ): HTMLElement {
    const { row, value: valueEl } = this.createRow_(label);
    const c = color === "mixed" ? null : color;

    const swatch = document.createElement("div");
    swatch.className = "re-style-swatch";
    if (c) swatch.style.background = `rgba(${c.r},${c.g},${c.b},${c.a})`;

    const hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.className = "re-style-input re-style-input--hex";
    hexInput.maxLength = 7;
    if (c) {
      hexInput.value = colorToHex(c);
    } else {
      hexInput.placeholder = "—";
    }

    const alphaInput = document.createElement("input");
    alphaInput.type = "number";
    alphaInput.className = "re-style-input re-style-input--number";
    alphaInput.min = "0";
    alphaInput.max = "100";
    if (c) {
      alphaInput.value = String(colorToAlphaPct(c));
    } else {
      alphaInput.placeholder = "—";
    }

    const commit = () => {
      const hexVal = hexInput.value.trim();
      const rawAlpha = alphaInput.value === "" ? "100" : alphaInput.value;
      const alphaPct = parseFloat(rawAlpha);
      if (!hexVal || isNaN(alphaPct)) return;
      const newColor = hexToColor(hexVal, alphaPct / 100);
      if (!newColor) return;
      swatch.style.background = `rgba(${newColor.r},${newColor.g},${newColor.b},${newColor.a})`;
      onChange(newColor);
    };

    hexInput.addEventListener("change", commit);
    alphaInput.addEventListener("change", commit);

    valueEl.appendChild(swatch);
    valueEl.appendChild(hexInput);
    valueEl.appendChild(alphaInput);
    valueEl.appendChild(document.createTextNode("%"));
    return row;
  }
}
