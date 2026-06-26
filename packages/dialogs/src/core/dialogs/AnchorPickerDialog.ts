import type { Presentation } from "@rippledoc/presentation4";
import type { AnchorPickTarget } from "../../clientAPI/AnchorPickTarget";
import type { DialogResult } from "../../clientAPI/DialogResult";
import type { DialogHost } from "../infrastructure/DialogHost";
import { el } from "./StyleControls";

function buildContent(
  presentation: Presentation,
  close: (result: DialogResult<AnchorPickTarget>) => void,
): { element: HTMLElement; onDismiss(): void } {
  let selected: AnchorPickTarget | null = null;

  const onDismiss = (): void => close({ committed: false });

  // Footer commit button — kept for enable/disable toggle as selection changes.
  const commitBtn = el("button", "rdoc-dlg-btn rdoc-dlg-btn--commit");
  commitBtn.textContent = "Select";
  commitBtn.disabled = true;

  const onCommit = (): void => {
    if (selected !== null) close({ committed: true, value: selected });
  };
  commitBtn.addEventListener("click", onCommit);

  // ── Tree body ───────────────────────────────────────────────────────────────

  const body = el("div", "rdoc-dlg-body rdoc-ap-body");

  const makeRow = (
    label: string,
    target: AnchorPickTarget,
    indented: boolean,
  ): HTMLElement => {
    const row = el(
      "div",
      "rdoc-ap-row" + (indented ? " rdoc-ap-row--indented" : ""),
    );
    row.textContent = label;
    row.tabIndex = 0;

    const select = (): void => {
      body
        .querySelectorAll(".rdoc-ap-row--selected")
        .forEach((r) => r.classList.remove("rdoc-ap-row--selected"));
      row.classList.add("rdoc-ap-row--selected");
      selected = target;
      commitBtn.disabled = false;
    };

    row.addEventListener("click", select);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
      }
    });
    row.addEventListener("dblclick", () => {
      select();
      onCommit();
    });
    return row;
  };

  const makeGroupLabel = (text: string): HTMLElement => {
    const label = el("div", "rdoc-ap-group-label");
    label.textContent = text;
    return label;
  };

  // Presentation Root
  body.appendChild(makeRow("Presentation Root", presentation.root, false));

  // Sections and their elements
  const sections = presentation.root.getSections();
  if (sections.length > 0) {
    body.appendChild(makeGroupLabel("Sections"));
    for (const section of sections) {
      body.appendChild(makeRow(section.name, section, false));
      for (const element of section.getElements()) {
        body.appendChild(makeRow(element.name, element, true));
      }
    }
  }

  // Scroll triggers
  const triggers = presentation.triggers;
  if (triggers.length > 0) {
    body.appendChild(makeGroupLabel("Scroll Triggers"));
    for (const trigger of triggers) {
      body.appendChild(
        makeRow(trigger.name || "Unnamed Trigger", trigger, false),
      );
    }
  }

  // ── Header / footer ─────────────────────────────────────────────────────────

  const header = el("div", "rdoc-dlg-header");
  const title = el("h2", "rdoc-dlg-title");
  title.textContent = "Pick Anchor Target";
  header.appendChild(title);

  const cancelBtn = el("button", "rdoc-dlg-btn rdoc-dlg-btn--cancel");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", onDismiss);

  const footer = el("div", "rdoc-dlg-footer");
  footer.append(cancelBtn, commitBtn);

  const dialog = el("div");
  dialog.append(header, body, footer);

  return { element: dialog, onDismiss };
}

export function openAnchorPickerDialog(
  host: DialogHost,
  presentation: Presentation,
): Promise<DialogResult<AnchorPickTarget>> {
  return host.show<DialogResult<AnchorPickTarget>>((close) =>
    buildContent(presentation, close),
  );
}
