import type { Presentation } from "@rippledoc/presentation4";
import type { NamedElementStyle } from "@rippledoc/presentation4";
import type { NamedSectionStyle } from "@rippledoc/presentation4";
import type { ElementStyleProps } from "@rippledoc/presentation4";
import type { SectionStyleProps } from "@rippledoc/presentation4";
import type { OperationSink } from "../../clientAPI/OperationSink";
import type { DialogHost } from "../infrastructure/DialogHost";
import {
  el,
  buildRow,
  ColorControl,
  FillControl,
  BorderControl,
  BorderRadiusControl,
  PaddingControl,
  FontFamilyControl,
  FontSizeControl,
  FontWeightControl,
  FontItalicControl,
} from "./StyleControls";

// ── Selection state ───────────────────────────────────────────────────────────

type Selection =
  | { readonly kind: "element"; readonly style: NamedElementStyle }
  | { readonly kind: "section"; readonly style: NamedSectionStyle }
  | null;

// ── Usage check ───────────────────────────────────────────────────────────────

function isElementStyleInUse(
  style: NamedElementStyle,
  presentation: Presentation,
): boolean {
  return presentation.root
    .getSections()
    .some((section) =>
      section
        .getElements()
        .some((element) => element.styles.named.includes(style)),
    );
}

function isSectionStyleInUse(
  style: NamedSectionStyle,
  presentation: Presentation,
): boolean {
  return presentation.root
    .getSections()
    .some((section) => section.styles.named.includes(style));
}

// ── Name generation ───────────────────────────────────────────────────────────

function nextElementStyleName(presentation: Presentation): string {
  const existing = new Set(
    presentation.styles.elementStyles.map((s) => s.name),
  );
  let n = 1;
  while (existing.has(`Element Style ${n}`)) n++;
  return `Element Style ${n}`;
}

function nextSectionStyleName(presentation: Presentation): string {
  const existing = new Set(
    presentation.styles.sectionStyles.map((s) => s.name),
  );
  let n = 1;
  while (existing.has(`Section Style ${n}`)) n++;
  return `Section Style ${n}`;
}

// ── Props serialisation equality ──────────────────────────────────────────────
//
// JSON.stringify is safe here: style props are plain value objects with no
// functions, no circular refs, and no NaN/Infinity. undefined keys are omitted
// by both sides, which matches the "not set" semantic.

function propsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── Element detail pane ───────────────────────────────────────────────────────

function buildElementProps(style: NamedElementStyle): ElementStyleProps {
  // Used to snapshot props for undo — not for reading live control values.
  return { ...style.props };
}

function buildElementDetailBody(
  style: NamedElementStyle,
  sink: OperationSink,
): HTMLElement {
  const p = style.props;
  const fill = new FillControl(p.fill);
  const border = new BorderControl(p.border);
  const borderRadius = new BorderRadiusControl(p.borderRadius);
  const padding = new PaddingControl(p.padding);
  const fontFamily = new FontFamilyControl(p.fontFamily);
  const fontSize = new FontSizeControl(p.fontSize);
  const fontWeight = new FontWeightControl(p.fontWeight);
  const fontColor = new ColorControl(p.fontColor);
  const fontItalic = new FontItalicControl(p.fontItalic);

  let committed = buildElementProps(style);

  function readControls(): ElementStyleProps {
    return {
      fill: fill.getValue(),
      border: border.getValue(),
      borderRadius: borderRadius.getValue(),
      padding: padding.getValue(),
      fontFamily: fontFamily.getValue(),
      fontSize: fontSize.getValue(),
      fontWeight: fontWeight.getValue(),
      fontColor: fontColor.getValue(),
      fontItalic: fontItalic.getValue(),
    };
  }

  function onChanged(): void {
    const newProps = readControls();
    if (propsEqual(newProps, committed)) return;
    const oldProps = committed;
    committed = newProps;
    style.setProps(newProps);
    sink.push({
      execute: () => style.setProps(newProps),
      undo: () => style.setProps(oldProps),
    });
  }

  const body = el("div", "rdoc-dlg-ns-props");
  body.append(
    buildRow("Fill", fill.element),
    buildRow("Border", border.element),
    buildRow("Border Radius", borderRadius.element),
    buildRow("Padding", padding.element),
    buildRow("Family", fontFamily.element),
    buildRow("Size", fontSize.element),
    buildRow("Weight", fontWeight.element),
    buildRow("Color", fontColor.element),
    buildRow("Italic", fontItalic.element),
  );

  // Both change (inputs/selects) and click (toggle/clear/unset buttons) can
  // alter control values. propsEqual guards against spurious undo ops.
  body.addEventListener("change", onChanged);
  body.addEventListener("click", onChanged);

  return body;
}

// ── Section detail pane ───────────────────────────────────────────────────────

function buildSectionDetailBody(
  style: NamedSectionStyle,
  sink: OperationSink,
): HTMLElement {
  const p = style.props;
  const fill = new FillControl(p.fill);
  const border = new BorderControl(p.border);
  const borderRadius = new BorderRadiusControl(p.borderRadius);

  let committed: SectionStyleProps = { ...style.props };

  function readControls(): SectionStyleProps {
    return {
      fill: fill.getValue(),
      border: border.getValue(),
      borderRadius: borderRadius.getValue(),
    };
  }

  function onChanged(): void {
    const newProps = readControls();
    if (propsEqual(newProps, committed)) return;
    const oldProps = committed;
    committed = newProps;
    style.setProps(newProps);
    sink.push({
      execute: () => style.setProps(newProps),
      undo: () => style.setProps(oldProps),
    });
  }

  const body = el("div", "rdoc-dlg-ns-props");
  body.append(
    buildRow("Fill", fill.element),
    buildRow("Border", border.element),
    buildRow("Border Radius", borderRadius.element),
  );
  body.addEventListener("change", onChanged);
  body.addEventListener("click", onChanged);

  return body;
}

// ── Name row ──────────────────────────────────────────────────────────────────

function buildNameRow(
  style: NamedElementStyle | NamedSectionStyle,
  sink: OperationSink,
): HTMLElement {
  const input = el("input", "rdoc-dlg-input rdoc-dlg-input--text");
  input.type = "text";
  input.value = style.name;

  const error = el("span", "rdoc-dlg-ns-name-error");

  input.addEventListener("change", () => {
    const newName = input.value.trim();
    if (!newName || newName === style.name) {
      input.value = style.name;
      error.textContent = "";
      return;
    }
    try {
      const oldName = style.name;
      style.setName(newName);
      error.textContent = "";
      sink.push({
        execute: () => style.setName(newName),
        undo: () => {
          style.setName(oldName);
          input.value = oldName;
        },
      });
    } catch {
      error.textContent = `"${input.value.trim()}" is already in use`;
      input.value = style.name;
    }
  });

  // ESC reverts; Enter commits (by blurring, which fires change).
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = style.name;
      error.textContent = "";
      input.blur();
    } else if (e.key === "Enter") {
      input.blur();
    }
  });

  const row = el("div", "rdoc-dlg-ns-name-row");
  row.append(input, error);
  return row;
}

// ── Detail pane ───────────────────────────────────────────────────────────────

function buildDetailPane(
  selection: Exclude<Selection, null>,
  sink: OperationSink,
): HTMLElement {
  const pane = el("div", "rdoc-dlg-ns-detail-content");
  pane.appendChild(buildNameRow(selection.style, sink));

  const divider = el("div", "rdoc-dlg-ns-props-divider");
  pane.appendChild(divider);

  if (selection.kind === "element") {
    pane.appendChild(buildElementDetailBody(selection.style, sink));
  } else {
    pane.appendChild(buildSectionDetailBody(selection.style, sink));
  }

  return pane;
}

// ── Dialog content ────────────────────────────────────────────────────────────

function buildContent(
  presentation: Presentation,
  sink: OperationSink,
  close: () => void,
): { element: HTMLElement; onDismiss(): void } {
  const styles = presentation.styles;
  let selection: Selection = null;

  // ── Detail pane ───────────────────────────────────────────────────────────

  const detail = el("div", "rdoc-dlg-ns-detail");

  function updateDetail(): void {
    detail.innerHTML = "";
    if (!selection) {
      const empty = el("p", "rdoc-dlg-ns-empty");
      empty.textContent = "Select a style to edit";
      detail.appendChild(empty);
    } else {
      detail.appendChild(buildDetailPane(selection, sink));
    }
  }

  // ── Sidebar list builders ─────────────────────────────────────────────────

  const elementListEl = el("div", "rdoc-dlg-ns-list");
  const sectionListEl = el("div", "rdoc-dlg-ns-list");

  function buildElementItem(style: NamedElementStyle): HTMLElement {
    const item = el("div", "rdoc-dlg-ns-item");
    if (selection?.kind === "element" && selection.style === style) {
      item.classList.add("rdoc-dlg-ns-item--selected");
    }

    const label = el("button", "rdoc-dlg-ns-item-label");
    label.textContent = style.name;
    label.addEventListener("click", () => {
      selection = { kind: "element", style };
      rebuildElementList();
      rebuildSectionList();
      updateDetail();
    });

    const inUse = isElementStyleInUse(style, presentation);
    const deleteBtn = el("button", "rdoc-dlg-ns-item-delete");
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", `Delete ${style.name}`);
    if (inUse) {
      deleteBtn.disabled = true;
      deleteBtn.title = "This style is applied to one or more elements";
    } else {
      deleteBtn.addEventListener("click", () => {
        if (selection?.kind === "element" && selection.style === style) {
          selection = null;
        }
        const oldName = style.name;
        const oldProps = { ...style.props };
        styles.deleteElementStyle(style);
        // V1 note: undo recreates a new style object; any elements that were
        // applying the original (pre-delete) object won't auto-reconnect.
        sink.push({
          execute: () => {
            const s = styles.elementStyles.find((x) => x.name === oldName);
            if (s) styles.deleteElementStyle(s);
          },
          undo: () => styles.createElementStyle(oldName, oldProps),
        });
        rebuildElementList();
        updateDetail();
      });
    }

    item.append(label, deleteBtn);
    return item;
  }

  function buildSectionItem(style: NamedSectionStyle): HTMLElement {
    const item = el("div", "rdoc-dlg-ns-item");
    if (selection?.kind === "section" && selection.style === style) {
      item.classList.add("rdoc-dlg-ns-item--selected");
    }

    const label = el("button", "rdoc-dlg-ns-item-label");
    label.textContent = style.name;
    label.addEventListener("click", () => {
      selection = { kind: "section", style };
      rebuildElementList();
      rebuildSectionList();
      updateDetail();
    });

    const inUse = isSectionStyleInUse(style, presentation);
    const deleteBtn = el("button", "rdoc-dlg-ns-item-delete");
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", `Delete ${style.name}`);
    if (inUse) {
      deleteBtn.disabled = true;
      deleteBtn.title = "This style is applied to one or more sections";
    } else {
      deleteBtn.addEventListener("click", () => {
        if (selection?.kind === "section" && selection.style === style) {
          selection = null;
        }
        const oldName = style.name;
        const oldProps = { ...style.props };
        styles.deleteSectionStyle(style);
        sink.push({
          execute: () => {
            const s = styles.sectionStyles.find((x) => x.name === oldName);
            if (s) styles.deleteSectionStyle(s);
          },
          undo: () => styles.createSectionStyle(oldName, oldProps),
        });
        rebuildSectionList();
        updateDetail();
      });
    }

    item.append(label, deleteBtn);
    return item;
  }

  function rebuildElementList(): void {
    elementListEl.innerHTML = "";
    for (const style of styles.elementStyles) {
      elementListEl.appendChild(buildElementItem(style));
    }
  }

  function rebuildSectionList(): void {
    sectionListEl.innerHTML = "";
    for (const style of styles.sectionStyles) {
      sectionListEl.appendChild(buildSectionItem(style));
    }
  }

  // ── Add buttons ───────────────────────────────────────────────────────────

  function buildAddElementBtn(): HTMLButtonElement {
    const btn = el("button", "rdoc-dlg-ns-add");
    btn.textContent = "+ New";
    btn.addEventListener("click", () => {
      const name = nextElementStyleName(presentation);
      const newStyle = styles.createElementStyle(name, {});
      sink.push({
        execute: () => styles.createElementStyle(name, {}),
        undo: () => styles.deleteElementStyle(newStyle),
      });
      selection = { kind: "element", style: newStyle };
      rebuildElementList();
      rebuildSectionList();
      updateDetail();
      // Focus the name input so the user can rename immediately.
      const nameInput = detail.querySelector<HTMLInputElement>(
        ".rdoc-dlg-ns-name-row input",
      );
      nameInput?.select();
    });
    return btn;
  }

  function buildAddSectionBtn(): HTMLButtonElement {
    const btn = el("button", "rdoc-dlg-ns-add");
    btn.textContent = "+ New";
    btn.addEventListener("click", () => {
      const name = nextSectionStyleName(presentation);
      const newStyle = styles.createSectionStyle(name, {});
      sink.push({
        execute: () => styles.createSectionStyle(name, {}),
        undo: () => styles.deleteSectionStyle(newStyle),
      });
      selection = { kind: "section", style: newStyle };
      rebuildElementList();
      rebuildSectionList();
      updateDetail();
      const nameInput = detail.querySelector<HTMLInputElement>(
        ".rdoc-dlg-ns-name-row input",
      );
      nameInput?.select();
    });
    return btn;
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────

  const elementGroup = el("div", "rdoc-dlg-ns-group");
  const elementGroupLabel = el("p", "rdoc-dlg-ns-group-label");
  elementGroupLabel.textContent = "Elements";
  elementGroup.append(elementGroupLabel, elementListEl, buildAddElementBtn());

  const sectionGroup = el("div", "rdoc-dlg-ns-group");
  const sectionGroupLabel = el("p", "rdoc-dlg-ns-group-label");
  sectionGroupLabel.textContent = "Sections";
  sectionGroup.append(sectionGroupLabel, sectionListEl, buildAddSectionBtn());

  const sidebar = el("div", "rdoc-dlg-ns-sidebar");
  sidebar.append(elementGroup, sectionGroup);

  // ── Header ────────────────────────────────────────────────────────────────

  const title = el("h2", "rdoc-dlg-title");
  title.textContent = "Named Styles";

  const closeBtn = el("button", "rdoc-dlg-btn rdoc-dlg-btn--close");
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", close);

  const header = el("div", "rdoc-dlg-header");
  header.append(title, closeBtn);

  // ── Assemble ──────────────────────────────────────────────────────────────

  rebuildElementList();
  rebuildSectionList();
  updateDetail();

  const layout = el("div", "rdoc-dlg-ns-layout");
  layout.append(sidebar, detail);

  const dialog = el("div");
  dialog.append(header, layout);

  return { element: dialog, onDismiss: close };
}

// ── Public entry point ────────────────────────────────────────────────────────

export function openNamedStylesDialog(
  host: DialogHost,
  presentation: Presentation,
  sink: OperationSink,
): Promise<void> {
  return host.show<void>((close) => buildContent(presentation, sink, close));
}
