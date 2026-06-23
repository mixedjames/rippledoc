import type { MarkdownElement } from "@rippledoc/presentation4";
import type { DialogResult } from "../../clientAPI/DialogResult";
import type { OperationSink } from "../../clientAPI/OperationSink";
import type { DialogHost } from "../infrastructure/DialogHost";
import { el } from "./StyleControls";

function buildHeader(): HTMLElement {
  const header = el("div", "rdoc-dlg-header");
  const h = el("h2", "rdoc-dlg-title");
  h.textContent = "Edit Markdown";
  header.appendChild(h);
  return header;
}

function buildFooter(onCancel: () => void, onCommit: () => void): HTMLElement {
  const footer = el("div", "rdoc-dlg-footer");

  const cancelBtn = el("button", "rdoc-dlg-btn rdoc-dlg-btn--cancel");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", onCancel);

  const commitBtn = el("button", "rdoc-dlg-btn rdoc-dlg-btn--commit");
  commitBtn.textContent = "Save";
  commitBtn.addEventListener("click", onCommit);

  footer.append(cancelBtn, commitBtn);
  return footer;
}

function buildContent(
  element: MarkdownElement,
  sink: OperationSink,
  close: (result: DialogResult<void>) => void,
): { element: HTMLElement; onDismiss(): void } {
  const snapshot = element.markdown;

  const textarea = el("textarea", "rdoc-dlg-md-textarea");
  textarea.value = snapshot;

  const onDismiss = (): void => close({ committed: false });

  const onCommit = (): void => {
    const newMarkdown = textarea.value;
    const op = {
      execute: (): void => {
        element.setMarkdown(newMarkdown);
      },
      undo: (): void => {
        element.setMarkdown(snapshot);
      },
    };
    op.execute();
    sink.push(op);
    close({ committed: true, value: undefined });
  };

  const body = el("div", "rdoc-dlg-body");
  body.appendChild(textarea);

  const dialog = el("div");
  dialog.append(buildHeader(), body, buildFooter(onDismiss, onCommit));

  return { element: dialog, onDismiss };
}

export function openMarkdownEditorDialog(
  host: DialogHost,
  element: MarkdownElement,
  sink: OperationSink,
): Promise<DialogResult<void>> {
  return host.show<DialogResult<void>>((close) =>
    buildContent(element, sink, close),
  );
}
