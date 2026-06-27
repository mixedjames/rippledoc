import type {
  Color,
  Fill,
  ComputedBorder,
  ElementStyleProps,
  SectionStyleProps,
  StyleRegistry,
} from "@rippledoc/presentation4";
import {
  SYSTEM_DEFAULT_ELEMENT_STYLE,
  SYSTEM_DEFAULT_SECTION_STYLE,
} from "@rippledoc/presentation4";
import type { DialogResult } from "../../clientAPI/DialogResult";
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

// ── Default value rendering ───────────────────────────────────────────────────

function renderDefaultText(text: string): HTMLElement {
  const span = el("span", "rdoc-dlg-default-val");
  span.textContent = text;
  return span;
}

function renderDefaultSwatch(c: Color): HTMLElement {
  const swatch = el("span", "rdoc-dlg-default-swatch");
  swatch.style.backgroundColor = `rgba(${c.r},${c.g},${c.b},${c.a})`;
  return swatch;
}

const HEX_RADIX = 16;

function renderDefaultColor(c: Color): HTMLElement {
  const label = el("span", "rdoc-dlg-default-val");
  const hex = (n: number) => Math.round(n).toString(HEX_RADIX).padStart(2, "0");
  label.textContent = `#${hex(c.r)}${hex(c.g)}${hex(c.b)} ${Math.round(c.a * 100)}%`;
  const wrap = el("div", "rdoc-dlg-group");
  wrap.append(renderDefaultSwatch(c), label);
  return wrap;
}

function renderDefaultFill(f: Fill): HTMLElement {
  if (f.type === "none") return renderDefaultText("None");
  if (f.type === "image") return renderDefaultText("Image");
  const label = el("span", "rdoc-dlg-default-val");
  label.textContent = "Solid";
  const wrap = el("div", "rdoc-dlg-group");
  wrap.append(label, renderDefaultSwatch(f.color));
  return wrap;
}

function renderDefaultBorder(b: ComputedBorder): HTMLElement {
  if (b.type === "none") return renderDefaultText("None");
  const label = el("span", "rdoc-dlg-default-val");
  label.textContent = `${b.width} basis ${b.style}`;
  const wrap = el("div", "rdoc-dlg-group");
  wrap.append(label, renderDefaultSwatch(b.color));
  return wrap;
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function buildSection(title: string, rows: HTMLElement[]): HTMLElement {
  const section = el("div", "rdoc-dlg-section");
  const spacer = el("span", "rdoc-dlg-section-header-spacer");
  const heading = el("p", "rdoc-dlg-section-title");
  heading.textContent = title;
  const defLabel = el("span", "rdoc-dlg-section-default-label");
  defLabel.textContent = "System default";
  const header = el("div", "rdoc-dlg-section-header");
  header.append(spacer, heading, defLabel);
  section.appendChild(header);
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
  const eBorderRadius = new BorderRadiusControl(es.borderRadius);
  const ePadding = new PaddingControl(es.padding);
  const eFontFamily = new FontFamilyControl(es.fontFamily);
  const eFontSize = new FontSizeControl(es.fontSize);
  const eFontWeight = new FontWeightControl(es.fontWeight);
  const eFontColor = new ColorControl(es.fontColor);
  const eFontItalic = new FontItalicControl(es.fontItalic);
  const sFill = new FillControl(ss.fill);
  const sBorder = new BorderControl(ss.border);
  const sBorderRadius = new BorderRadiusControl(ss.borderRadius);

  const onDismiss = (): void => close({ committed: false });

  const onCommit = (): void => {
    const newElement: ElementStyleProps = {
      fill: eFill.getValue(),
      border: eBorder.getValue(),
      borderRadius: eBorderRadius.getValue(),
      padding: ePadding.getValue(),
      fontFamily: eFontFamily.getValue(),
      fontSize: eFontSize.getValue(),
      fontWeight: eFontWeight.getValue(),
      fontColor: eFontColor.getValue(),
      fontItalic: eFontItalic.getValue(),
    };
    const newSection: SectionStyleProps = {
      fill: sFill.getValue(),
      border: sBorder.getValue(),
      borderRadius: sBorderRadius.getValue(),
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

  const ed = SYSTEM_DEFAULT_ELEMENT_STYLE;
  const sd = SYSTEM_DEFAULT_SECTION_STYLE;

  const body = el("div", "rdoc-dlg-body");
  body.append(
    buildSection("Elements", [
      buildRow("Fill", eFill.element, renderDefaultFill(ed.fill)),
      buildRow("Border", eBorder.element, renderDefaultBorder(ed.border)),
      buildRow(
        "Border Radius",
        eBorderRadius.element,
        renderDefaultText(`${ed.borderRadius} basis`),
      ),
      buildRow(
        "Padding",
        ePadding.element,
        renderDefaultText(`${ed.padding} basis`),
      ),
      buildRow("Family", eFontFamily.element, renderDefaultText(ed.fontFamily)),
      buildRow(
        "Size",
        eFontSize.element,
        renderDefaultText(`${ed.fontSize} basis`),
      ),
      buildRow(
        "Weight",
        eFontWeight.element,
        renderDefaultText(String(ed.fontWeight)),
      ),
      buildRow("Color", eFontColor.element, renderDefaultColor(ed.fontColor)),
      buildRow(
        "Italic",
        eFontItalic.element,
        renderDefaultText(ed.fontItalic ? "Italic" : "Normal"),
      ),
    ]),
    buildSection("Sections", [
      buildRow("Fill", sFill.element, renderDefaultFill(sd.fill)),
      buildRow("Border", sBorder.element, renderDefaultBorder(sd.border)),
      buildRow(
        "Border Radius",
        sBorderRadius.element,
        renderDefaultText(`${sd.borderRadius} basis`),
      ),
    ]),
  );

  const dialog = el("div");
  dialog.append(
    buildHeader("Global Styles"),
    body,
    buildFooter(onDismiss, onCommit),
  );

  return { element: dialog, onDismiss };
}

// ── Public entry point ────────────────────────────────────────────────────────

export function openGlobalStylesDialog(
  host: DialogHost,
  styles: StyleRegistry,
  sink: OperationSink,
): Promise<DialogResult<void>> {
  return host.show<DialogResult<void>>((close) =>
    buildContent(styles, sink, close),
  );
}
