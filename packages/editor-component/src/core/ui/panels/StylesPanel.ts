import type {
  Element,
  Section,
  MarkdownElement,
  Color,
  Fill,
  ImageFit,
  Border,
  BorderEdgeStyle,
  ComputedBorder,
  ComputedElementStyle,
  FontWeight,
  ElementStyleProps,
  SectionStyleProps,
  StyleRegistry,
  NamedElementStyle,
  NamedSectionStyle,
} from "@rippledoc/presentation4";
import type { EditOperation } from "../../history/EditOperation";
import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";
import { colorToHex, hexToColor, colorToAlphaPct } from "../widgets/colorUtils";

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * Agreed-upon font property values across a multi-selection.
 * Each property is `"mixed"` (or `null` for family) when the selected elements
 * disagree. Computed values are used for display — own-style raw values are
 * not shown directly, which is why the unit selector always defaults to "basis".
 */
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

/**
 * Where in the cascade a style property's value originates.
 * Mirrors the p4 style cascade: own → named styles (in order) → global → system default.
 * Shown as a source badge next to each property row so users can see what they are overriding.
 * "system" means no explicit value is set anywhere — the system default applies.
 */
type StyleSource =
  | { level: "own" }
  | { level: "named"; name: string }
  | { level: "global" }
  | { level: "system" };

/**
 * Agreed-upon source across a multi-selection.
 * "mixed" means elements in the selection disagree on which cascade level provides the value.
 * Own styles are not badged (the absence of a badge already signals "set here directly").
 */
type SourceConsensus = StyleSource | "mixed";

interface FontSourceConsensus {
  family: SourceConsensus;
  size: SourceConsensus;
  weight: SourceConsensus;
  color: SourceConsensus;
  italic: SourceConsensus;
}

/** Options passed to `createNamedTag_`. */
interface NamedTagOpts {
  name: string;
  partial: boolean;
  /** Tooltip shown when the style is partially applied. */
  title?: string;
  onRemove: () => void;
}

/** Options passed to fill/border section renderers. */
interface SectionOpts {
  source: SourceConsensus;
  /** When provided, a "clear" button is shown that removes the section's own-level properties. */
  onClear?: () => void;
}

/** Options passed to the font section renderer. */
interface FontSectionOpts {
  sources: FontSourceConsensus;
  onClear?: () => void;
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
  if (a.type === "image" && b.type === "image")
    return a.src === b.src && a.fit === b.fit;
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

function consensusNumber(values: number[]): number | "mixed" {
  const first = values[0]!;
  return values.every((v) => v === first) ? first : "mixed";
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

// ── Source helpers ─────────────────────────────────────────────────────────────

function sourcesEqual(a: StyleSource, b: StyleSource): boolean {
  if (a.level !== b.level) return false;
  if (a.level === "named" && b.level === "named") return a.name === b.name;
  return true;
}

function consensusSource(sources: StyleSource[]): SourceConsensus {
  if (sources.length === 0) return { level: "system" };
  const first = sources[0]!;
  return sources.every((s) => sourcesEqual(s, first)) ? first : "mixed";
}

function elementPropSource<K extends keyof ElementStyleProps>(
  el: Element,
  key: K,
  registry: StyleRegistry,
): StyleSource {
  if (el.styles.own[key] !== undefined) return { level: "own" };
  for (const style of el.styles.named) {
    if (style.props[key] !== undefined)
      return { level: "named", name: style.name };
  }
  if (registry.globalElementStyle[key] !== undefined)
    return { level: "global" };
  return { level: "system" };
}

function sectionPropSource<K extends keyof SectionStyleProps>(
  section: Section,
  key: K,
  registry: StyleRegistry,
): StyleSource {
  if (section.styles.own[key] !== undefined) return { level: "own" };
  for (const style of section.styles.named) {
    if (style.props[key] !== undefined)
      return { level: "named", name: style.name };
  }
  if (registry.globalSectionStyle[key] !== undefined)
    return { level: "global" };
  return { level: "system" };
}

/**
 * Returns the annotation label for a source, or null when no annotation is needed
 * (own styles are not annotated — the absence of a badge signals "set here").
 */
function sourceLabel(source: SourceConsensus): string | null {
  if (source === "mixed" || source.level === "own") return null;
  if (source.level === "named") return source.name;
  if (source.level === "global") return "global";
  return "default";
}

// ── Own-prop checks (for showing the clear button) ────────────────────────────

function hasOwnFontProp(el: Element): boolean {
  const own = el.styles.own;
  return (
    own.fontFamily !== undefined ||
    own.fontSize !== undefined ||
    own.fontWeight !== undefined ||
    own.fontColor !== undefined ||
    own.fontItalic !== undefined
  );
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

function makeClearElementFillOp(elements: ReadonlySet<Element>): EditOperation {
  const snapshots = new Map([...elements].map((el) => [el, el.styles.own]));
  return {
    execute() {
      for (const el of elements) {
        const rest: ElementStyleProps = { ...snapshots.get(el)! };
        delete rest.fill;
        el.styles.set(rest);
      }
    },
    undo() {
      for (const el of elements) {
        el.styles.set(snapshots.get(el)!);
      }
    },
  };
}

function makeClearElementBorderOp(
  elements: ReadonlySet<Element>,
): EditOperation {
  const snapshots = new Map([...elements].map((el) => [el, el.styles.own]));
  return {
    execute() {
      for (const el of elements) {
        const rest: ElementStyleProps = { ...snapshots.get(el)! };
        delete rest.border;
        el.styles.set(rest);
      }
    },
    undo() {
      for (const el of elements) {
        el.styles.set(snapshots.get(el)!);
      }
    },
  };
}

function makeClearElementBorderRadiusOp(
  elements: ReadonlySet<Element>,
): EditOperation {
  const snapshots = new Map([...elements].map((el) => [el, el.styles.own]));
  return {
    execute() {
      for (const el of elements) {
        const rest: ElementStyleProps = { ...snapshots.get(el)! };
        delete rest.borderRadius;
        el.styles.set(rest);
      }
    },
    undo() {
      for (const el of elements) {
        el.styles.set(snapshots.get(el)!);
      }
    },
  };
}

function makeClearElementPaddingOp(
  elements: ReadonlySet<Element>,
): EditOperation {
  const snapshots = new Map([...elements].map((el) => [el, el.styles.own]));
  return {
    execute() {
      for (const el of elements) {
        const rest: ElementStyleProps = { ...snapshots.get(el)! };
        delete rest.padding;
        el.styles.set(rest);
      }
    },
    undo() {
      for (const el of elements) {
        el.styles.set(snapshots.get(el)!);
      }
    },
  };
}

function makeClearElementFontOp(elements: ReadonlySet<Element>): EditOperation {
  const snapshots = new Map([...elements].map((el) => [el, el.styles.own]));
  return {
    execute() {
      for (const el of elements) {
        const rest: ElementStyleProps = { ...snapshots.get(el)! };
        delete rest.fontFamily;
        delete rest.fontSize;
        delete rest.fontWeight;
        delete rest.fontColor;
        delete rest.fontItalic;
        el.styles.set(rest);
      }
    },
    undo() {
      for (const el of elements) {
        el.styles.set(snapshots.get(el)!);
      }
    },
  };
}

function makeClearSectionFillOp(sections: ReadonlySet<Section>): EditOperation {
  const snapshots = new Map([...sections].map((s) => [s, s.styles.own]));
  return {
    execute() {
      for (const s of sections) {
        const rest: SectionStyleProps = { ...snapshots.get(s)! };
        delete rest.fill;
        s.styles.set(rest);
      }
    },
    undo() {
      for (const s of sections) {
        s.styles.set(snapshots.get(s)!);
      }
    },
  };
}

function makeClearSectionBorderOp(
  sections: ReadonlySet<Section>,
): EditOperation {
  const snapshots = new Map([...sections].map((s) => [s, s.styles.own]));
  return {
    execute() {
      for (const s of sections) {
        const rest: SectionStyleProps = { ...snapshots.get(s)! };
        delete rest.border;
        s.styles.set(rest);
      }
    },
    undo() {
      for (const s of sections) {
        s.styles.set(snapshots.get(s)!);
      }
    },
  };
}

function makeClearSectionBorderRadiusOp(
  sections: ReadonlySet<Section>,
): EditOperation {
  const snapshots = new Map([...sections].map((s) => [s, s.styles.own]));
  return {
    execute() {
      for (const s of sections) {
        const rest: SectionStyleProps = { ...snapshots.get(s)! };
        delete rest.borderRadius;
        s.styles.set(rest);
      }
    },
    undo() {
      for (const s of sections) {
        s.styles.set(snapshots.get(s)!);
      }
    },
  };
}

function makeAddElementNamedOp(
  elements: ReadonlySet<Element>,
  style: NamedElementStyle,
): EditOperation {
  const targets = [...elements].filter(
    (el) => !el.styles.named.includes(style),
  );
  return {
    execute() {
      for (const el of targets) el.styles.addNamed(style);
    },
    undo() {
      for (const el of targets) el.styles.removeNamed(style);
    },
  };
}

function makeRemoveElementNamedOp(
  elements: ReadonlySet<Element>,
  style: NamedElementStyle,
): EditOperation {
  // Undo re-adds at the end of the named list. Cascade position is not restored.
  // Acceptable in v1 — there is no reordering UI.
  const targets = [...elements].filter((el) => el.styles.named.includes(style));
  return {
    execute() {
      for (const el of targets) el.styles.removeNamed(style);
    },
    undo() {
      for (const el of targets) el.styles.addNamed(style);
    },
  };
}

function makeAddSectionNamedOp(
  sections: ReadonlySet<Section>,
  style: NamedSectionStyle,
): EditOperation {
  const targets = [...sections].filter((s) => !s.styles.named.includes(style));
  return {
    execute() {
      for (const s of targets) s.styles.addNamed(style);
    },
    undo() {
      for (const s of targets) s.styles.removeNamed(style);
    },
  };
}

function makeRemoveSectionNamedOp(
  sections: ReadonlySet<Section>,
  style: NamedSectionStyle,
): EditOperation {
  const targets = [...sections].filter((s) => s.styles.named.includes(style));
  return {
    execute() {
      for (const s of targets) s.styles.removeNamed(style);
    },
    undo() {
      for (const s of targets) s.styles.addNamed(style);
    },
  };
}

// ── Panel ─────────────────────────────────────────────────────────────────────

/**
 * Sidebar panel for fill, border, and font style editing.
 *
 * **Multi-selection:** the panel renders for whatever is currently selected
 * (elements take priority over sections). When multiple items are selected,
 * "consensus" helpers reduce the set to a single display value or `"mixed"`.
 * Editing a mixed field overwrites all selected items with the new value.
 *
 * **Cascade display:** each property row shows a source badge (named style name,
 * "global", or "default") indicating which cascade level supplies the value.
 * Own-level properties are un-badged. A "clear" button appears when at least one
 * selected item has an own-level value for that property group, allowing the
 * user to unset the override and fall back to the cascade.
 *
 * **Write path:** all mutations go through `push_` (the `PushOperation` callback),
 * never via direct property assignment. Each change creates a new `EditOperation`
 * that snapshots the before-state at construction time.
 */
export class StylesPanel implements SidebarPanel {
  readonly title = "Styles";
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;
  private requestImageImport_: () => Promise<{ src: string } | null>;

  constructor(
    state: EditorState,
    push: PushOperation,
    requestImageImport: () => Promise<{ src: string } | null>,
  ) {
    this.state_ = state;
    this.push_ = push;
    this.requestImageImport_ = requestImageImport;
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
    const els = [...elements];
    const styles = els.map((el) => el.styles.computed);
    const registry = this.state_.presentation.styles;
    const markdownEls = els.filter(isMarkdown);

    this.renderNamedElementStyles_(elements);

    const fill = consensusFill(styles.map((s) => s.fill));
    const fillSource = consensusSource(
      els.map((el) => elementPropSource(el, "fill", registry)),
    );
    this.renderFillSection_(
      fill,
      {
        source: fillSource,
        onClear: els.some((el) => el.styles.own.fill !== undefined)
          ? () => {
              this.push_(makeClearElementFillOp(elements));
              this.update();
            }
          : undefined,
      },
      (f) => {
        this.push_(makeElementStyleOp(elements, { fill: f }));
        this.update();
      },
    );

    const border = consensusBorder(styles.map((s) => s.border));
    const borderSource = consensusSource(
      els.map((el) => elementPropSource(el, "border", registry)),
    );
    this.renderBorderSection_(
      border,
      {
        source: borderSource,
        onClear: els.some((el) => el.styles.own.border !== undefined)
          ? () => {
              this.push_(makeClearElementBorderOp(elements));
              this.update();
            }
          : undefined,
      },
      (b) => {
        this.push_(makeElementStyleOp(elements, { border: b }));
        this.update();
      },
    );

    const borderRadius = consensusNumber(styles.map((s) => s.borderRadius));
    const borderRadiusSource = consensusSource(
      els.map((el) => elementPropSource(el, "borderRadius", registry)),
    );
    this.renderBorderRadiusSection_(
      borderRadius,
      {
        source: borderRadiusSource,
        onClear: els.some((el) => el.styles.own.borderRadius !== undefined)
          ? () => {
              this.push_(makeClearElementBorderRadiusOp(elements));
              this.update();
            }
          : undefined,
      },
      (v) => {
        this.push_(
          makeElementStyleOp(elements, {
            borderRadius: { unit: "basis", value: v },
          }),
        );
        this.update();
      },
    );

    const padding = consensusNumber(styles.map((s) => s.padding));
    const paddingSource = consensusSource(
      els.map((el) => elementPropSource(el, "padding", registry)),
    );
    this.renderPaddingSection_(
      padding,
      {
        source: paddingSource,
        onClear: els.some((el) => el.styles.own.padding !== undefined)
          ? () => {
              this.push_(makeClearElementPaddingOp(elements));
              this.update();
            }
          : undefined,
      },
      (v) => {
        this.push_(
          makeElementStyleOp(elements, {
            padding: { unit: "basis", value: v },
          }),
        );
        this.update();
      },
    );

    if (markdownEls.length > 0) {
      const mdStyles = markdownEls.map((el) => el.styles.computed);
      const font = consensusFont(mdStyles);
      const mdSet = new Set<Element>(markdownEls);
      this.renderFontSection_(
        font,
        {
          sources: {
            family: consensusSource(
              markdownEls.map((el) =>
                elementPropSource(el, "fontFamily", registry),
              ),
            ),
            size: consensusSource(
              markdownEls.map((el) =>
                elementPropSource(el, "fontSize", registry),
              ),
            ),
            weight: consensusSource(
              markdownEls.map((el) =>
                elementPropSource(el, "fontWeight", registry),
              ),
            ),
            color: consensusSource(
              markdownEls.map((el) =>
                elementPropSource(el, "fontColor", registry),
              ),
            ),
            italic: consensusSource(
              markdownEls.map((el) =>
                elementPropSource(el, "fontItalic", registry),
              ),
            ),
          },
          onClear: markdownEls.some(hasOwnFontProp)
            ? () => {
                this.push_(makeClearElementFontOp(mdSet));
                this.update();
              }
            : undefined,
        },
        (patch) => {
          this.push_(makeElementStyleOp(mdSet, patch));
          this.update();
        },
      );
    }
  }

  private renderSectionStyles_(sections: ReadonlySet<Section>): void {
    const secs = [...sections];
    const styles = secs.map((s) => s.styles.computed);
    const registry = this.state_.presentation.styles;

    this.renderNamedSectionStyles_(sections);

    const fill = consensusFill(styles.map((s) => s.fill));
    const fillSource = consensusSource(
      secs.map((s) => sectionPropSource(s, "fill", registry)),
    );
    this.renderFillSection_(
      fill,
      {
        source: fillSource,
        onClear: secs.some((s) => s.styles.own.fill !== undefined)
          ? () => {
              this.push_(makeClearSectionFillOp(sections));
              this.update();
            }
          : undefined,
      },
      (f) => {
        this.push_(makeSectionStyleOp(sections, { fill: f }));
        this.update();
      },
    );

    const border = consensusBorder(styles.map((s) => s.border));
    const borderSource = consensusSource(
      secs.map((s) => sectionPropSource(s, "border", registry)),
    );
    this.renderBorderSection_(
      border,
      {
        source: borderSource,
        onClear: secs.some((s) => s.styles.own.border !== undefined)
          ? () => {
              this.push_(makeClearSectionBorderOp(sections));
              this.update();
            }
          : undefined,
      },
      (b) => {
        this.push_(makeSectionStyleOp(sections, { border: b }));
        this.update();
      },
    );

    const borderRadius = consensusNumber(styles.map((s) => s.borderRadius));
    const borderRadiusSource = consensusSource(
      secs.map((s) => sectionPropSource(s, "borderRadius", registry)),
    );
    this.renderBorderRadiusSection_(
      borderRadius,
      {
        source: borderRadiusSource,
        onClear: secs.some((s) => s.styles.own.borderRadius !== undefined)
          ? () => {
              this.push_(makeClearSectionBorderRadiusOp(sections));
              this.update();
            }
          : undefined,
      },
      (v) => {
        this.push_(
          makeSectionStyleOp(sections, {
            borderRadius: { unit: "basis", value: v },
          }),
        );
        this.update();
      },
    );
  }

  // ── Named style renderers ─────────────────────────────────────────────────

  private renderNamedElementStyles_(elements: ReadonlySet<Element>): void {
    const els = [...elements];
    const allStyles = this.state_.presentation.styles.elementStyles;
    if (allStyles.length === 0) return;

    const { section, body } = this.createSection_("Named Styles");
    this.element.appendChild(section);

    const appliedAny = allStyles.filter((s) =>
      els.some((el) => el.styles.named.includes(s)),
    );
    if (appliedAny.length > 0) {
      const tagsRow = document.createElement("div");
      tagsRow.className = "re-style-named-tags";
      for (const style of appliedAny) {
        const count = els.filter((el) =>
          el.styles.named.includes(style),
        ).length;
        const partial = count < els.length;
        tagsRow.appendChild(
          this.createNamedTag_({
            name: style.name,
            partial,
            title: partial
              ? `Applied to ${count} of ${els.length} selected`
              : undefined,
            onRemove: () => {
              this.push_(makeRemoveElementNamedOp(elements, style));
              this.update();
            },
          }),
        );
      }
      body.appendChild(tagsRow);
    }

    const notAll = allStyles.filter(
      (s) => !els.every((el) => el.styles.named.includes(s)),
    );
    if (notAll.length > 0) {
      const addSelect = this.createSelect_(
        [
          { value: "", label: "+ Add style" },
          ...notAll.map((s) => ({ value: s.name, label: s.name })),
        ],
        "",
      );
      addSelect.classList.add("re-style-named-add");
      addSelect.addEventListener("change", () => {
        const name = addSelect.value;
        if (!name) return;
        const style = allStyles.find((s) => s.name === name)!;
        this.push_(makeAddElementNamedOp(elements, style));
        addSelect.value = "";
        this.update();
      });
      body.appendChild(addSelect);
    }
  }

  private renderNamedSectionStyles_(sections: ReadonlySet<Section>): void {
    const secs = [...sections];
    const allStyles = this.state_.presentation.styles.sectionStyles;
    if (allStyles.length === 0) return;

    const { section, body } = this.createSection_("Named Styles");
    this.element.appendChild(section);

    const appliedAny = allStyles.filter((s) =>
      secs.some((sec) => sec.styles.named.includes(s)),
    );
    if (appliedAny.length > 0) {
      const tagsRow = document.createElement("div");
      tagsRow.className = "re-style-named-tags";
      for (const style of appliedAny) {
        const count = secs.filter((sec) =>
          sec.styles.named.includes(style),
        ).length;
        const partial = count < secs.length;
        tagsRow.appendChild(
          this.createNamedTag_({
            name: style.name,
            partial,
            title: partial
              ? `Applied to ${count} of ${secs.length} selected`
              : undefined,
            onRemove: () => {
              this.push_(makeRemoveSectionNamedOp(sections, style));
              this.update();
            },
          }),
        );
      }
      body.appendChild(tagsRow);
    }

    const notAll = allStyles.filter(
      (s) => !secs.every((sec) => sec.styles.named.includes(s)),
    );
    if (notAll.length > 0) {
      const addSelect = this.createSelect_(
        [
          { value: "", label: "+ Add style" },
          ...notAll.map((s) => ({ value: s.name, label: s.name })),
        ],
        "",
      );
      addSelect.classList.add("re-style-named-add");
      addSelect.addEventListener("change", () => {
        const name = addSelect.value;
        if (!name) return;
        const style = allStyles.find((s) => s.name === name)!;
        this.push_(makeAddSectionNamedOp(sections, style));
        addSelect.value = "";
        this.update();
      });
      body.appendChild(addSelect);
    }
  }

  private createNamedTag_(opts: NamedTagOpts): HTMLElement {
    const tag = document.createElement("span");
    tag.className = opts.partial
      ? "re-style-named-tag re-style-named-tag--partial"
      : "re-style-named-tag";
    if (opts.title) tag.title = opts.title;

    const nameSpan = document.createElement("span");
    nameSpan.className = "re-style-named-tag__name";
    nameSpan.textContent = opts.name;
    tag.appendChild(nameSpan);

    const removeBtn = document.createElement("button");
    removeBtn.className = "re-style-named-tag__remove";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", opts.onRemove);
    tag.appendChild(removeBtn);
    return tag;
  }

  // ── Section renderers ─────────────────────────────────────────────────────

  private renderFillSection_(
    fill: Fill | "mixed",
    opts: SectionOpts,
    onChange: (fill: Fill) => void,
  ): void {
    const { section, body } = this.createSection_(
      "Fill",
      opts.source,
      opts.onClear,
    );
    this.element.appendChild(section);

    const isMixed = fill === "mixed";
    const typeOpts = isMixed
      ? [
          { value: "mixed", label: "—" },
          { value: "none", label: "None" },
          { value: "solid", label: "Solid" },
          { value: "image", label: "Image" },
        ]
      : [
          { value: "none", label: "None" },
          { value: "solid", label: "Solid" },
          { value: "image", label: "Image" },
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

    if (!isMixed && fill.type === "image") {
      const currentFill = fill;

      const srcRow = document.createElement("div");
      srcRow.className = "re-prop-src";
      srcRow.textContent = currentFill.src || "(no source)";
      body.appendChild(srcRow);

      const chooseBtn = document.createElement("button");
      chooseBtn.className = "re-panel-action-btn";
      chooseBtn.textContent = "Choose image…";
      chooseBtn.addEventListener("click", () => {
        void this.requestImageImport_().then((result) => {
          if (!result) return;
          onChange({ type: "image", src: result.src, fit: currentFill.fit });
          srcRow.textContent = result.src;
        });
      });
      body.appendChild(chooseBtn);

      const { row: fitRow, value: fitWrap } = this.createRow_("Fit");
      const fitSelect = this.createSelect_(
        [
          { value: "contain", label: "Contain" },
          { value: "cover", label: "Cover" },
          { value: "fill", label: "Fill" },
          { value: "none", label: "None" },
        ],
        currentFill.fit,
      );
      fitSelect.addEventListener("change", () => {
        onChange({
          type: "image",
          src: currentFill.src,
          fit: fitSelect.value as ImageFit,
        });
      });
      fitWrap.appendChild(fitSelect);
      body.appendChild(fitRow);
    }

    typeSelect.addEventListener("change", () => {
      const newType = typeSelect.value as "none" | "solid" | "image" | "mixed";
      if (newType === "mixed") return;
      if (newType === "none") {
        onChange({ type: "none" });
      } else if (newType === "solid") {
        const defaultColor =
          !isMixed && fill.type === "solid"
            ? fill.color
            : { r: 255, g: 255, b: 255, a: 1 };
        onChange({ type: "solid", color: defaultColor });
      } else {
        onChange({ type: "image", src: "", fit: "contain" });
      }
    });
  }

  private renderBorderSection_(
    border: ComputedBorder | "mixed",
    opts: SectionOpts,
    onChange: (b: Border) => void,
  ): void {
    const { section, body } = this.createSection_(
      "Border",
      opts.source,
      opts.onClear,
    );
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
    opts: FontSectionOpts,
    onChange: (patch: ElementStyleProps) => void,
  ): void {
    const { section, body } = this.createSection_(
      "Font",
      undefined,
      opts.onClear,
    );
    this.element.appendChild(section);

    const { sources } = opts;

    // Family
    const { row: familyRow, value: familyValue } = this.createRow_(
      "Family",
      sources.family,
    );
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
    const { row: sizeRow, value: sizeValue } = this.createRow_(
      "Size",
      sources.size,
    );
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
    const { row: weightRow, value: weightValue } = this.createRow_(
      "Weight",
      sources.weight,
    );
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

    // Color — createColorRow_ is 3 params, so the source badge is injected after the call.
    const colorRow = this.createColorRow_(
      "Color",
      font.color === "mixed" ? "mixed" : font.color,
      (color) => {
        onChange({ fontColor: color });
      },
    );
    const colorSrcLabel = sourceLabel(sources.color);
    if (colorSrcLabel !== null) {
      const badge = document.createElement("span");
      badge.className = "re-style-source re-style-source--row";
      badge.textContent = colorSrcLabel;
      // Insert between the label span (first child) and the value div (second child).
      colorRow.insertBefore(badge, colorRow.children[1]!);
    }
    body.appendChild(colorRow);

    // Italic
    const { row: italicRow, value: italicValue } = this.createRow_(
      "Italic",
      sources.italic,
    );
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

  private renderBorderRadiusSection_(
    borderRadius: number | "mixed",
    opts: SectionOpts,
    onChange: (v: number) => void,
  ): void {
    const { section, body } = this.createSection_(
      "Border Radius",
      opts.source,
      opts.onClear,
    );
    this.element.appendChild(section);

    const { row, value: valueEl } = this.createRow_("Radius");
    const input = document.createElement("input");
    input.type = "number";
    input.className = "re-style-input re-style-input--number";
    input.min = "0";
    if (borderRadius === "mixed") {
      input.placeholder = "—";
    } else {
      input.value = String(borderRadius);
    }
    input.addEventListener("change", () => {
      const v = parseFloat(input.value);
      if (isNaN(v) || v < 0) return;
      onChange(v);
    });
    valueEl.appendChild(input);
    valueEl.appendChild(document.createTextNode(" basis"));
    body.appendChild(row);
  }

  private renderPaddingSection_(
    padding: number | "mixed",
    opts: SectionOpts,
    onChange: (v: number) => void,
  ): void {
    const { section, body } = this.createSection_(
      "Padding",
      opts.source,
      opts.onClear,
    );
    this.element.appendChild(section);

    const { row, value: valueEl } = this.createRow_("Padding");
    const input = document.createElement("input");
    input.type = "number";
    input.className = "re-style-input re-style-input--number";
    input.min = "0";
    if (padding === "mixed") {
      input.placeholder = "—";
    } else {
      input.value = String(padding);
    }
    input.addEventListener("change", () => {
      const v = parseFloat(input.value);
      if (isNaN(v) || v < 0) return;
      onChange(v);
    });
    valueEl.appendChild(input);
    valueEl.appendChild(document.createTextNode(" basis"));
    body.appendChild(row);
  }

  // ── Widget helpers ────────────────────────────────────────────────────────

  private createSection_(
    title: string,
    source?: SourceConsensus,
    onClear?: () => void,
  ): { section: HTMLElement; body: HTMLElement } {
    const section = document.createElement("div");
    section.className = "re-style-section";
    const titleEl = document.createElement("div");
    titleEl.className = "re-style-section__title";

    const titleText = document.createElement("span");
    titleText.textContent = title;
    titleEl.appendChild(titleText);

    const srcLabel = source !== undefined ? sourceLabel(source) : null;
    if (srcLabel !== null) {
      const badge = document.createElement("span");
      badge.className = "re-style-source";
      badge.textContent = srcLabel;
      titleEl.appendChild(badge);
    }

    if (onClear !== undefined) {
      const clearBtn = document.createElement("button");
      clearBtn.className = "re-style-clear";
      clearBtn.textContent = "clear";
      clearBtn.addEventListener("click", onClear);
      titleEl.appendChild(clearBtn);
    }

    const body = document.createElement("div");
    body.className = "re-style-section__body";
    section.appendChild(titleEl);
    section.appendChild(body);
    return { section, body };
  }

  private createRow_(
    label: string,
    source?: SourceConsensus,
  ): {
    row: HTMLElement;
    value: HTMLElement;
  } {
    const row = document.createElement("div");
    row.className = "re-style-row";
    const lbl = document.createElement("span");
    lbl.className = "re-style-row__label";
    lbl.textContent = label;
    row.appendChild(lbl);
    const srcLabel = source !== undefined ? sourceLabel(source) : null;
    if (srcLabel !== null) {
      const badge = document.createElement("span");
      badge.className = "re-style-source re-style-source--row";
      badge.textContent = srcLabel;
      row.appendChild(badge);
    }
    const val = document.createElement("div");
    val.className = "re-style-row__value";
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
