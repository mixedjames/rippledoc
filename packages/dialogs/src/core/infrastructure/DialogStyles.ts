const DIALOG_CSS = `
.rdoc-dlg-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.rdoc-dlg-backdrop--open {
  display: flex;
}

.rdoc-dlg-box {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  min-width: 460px;
  max-width: 640px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: system-ui, sans-serif;
  font-size: 12px;
  color: #1a1a1a;
}

/* Header */
.rdoc-dlg-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.rdoc-dlg-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

/* Body */
.rdoc-dlg-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

/* Sections */
.rdoc-dlg-section + .rdoc-dlg-section {
  border-top: 1px solid #ebebeb;
  margin-top: 10px;
  padding-top: 10px;
}

.rdoc-dlg-section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.rdoc-dlg-section-header-spacer {
  flex: 0 0 52px;
}

.rdoc-dlg-section-title {
  flex: 1;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a8a8a;
  margin: 0;
}

.rdoc-dlg-section-default-label {
  flex: 0 0 140px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #c8c8c8;
}

/* Rows */
.rdoc-dlg-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 26px;
  margin-bottom: 4px;
}

.rdoc-dlg-row-label {
  flex: 0 0 52px;
  font-size: 11px;
  color: #8a8a8a;
}

.rdoc-dlg-row-control {
  flex: 1;
  display: flex;
  align-items: center;
}

.rdoc-dlg-row-default {
  flex: 0 0 140px;
  display: flex;
  align-items: center;
}

.rdoc-dlg-default-val {
  font-size: 11px;
  color: #b8b8b8;
  font-style: italic;
}

.rdoc-dlg-default-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

/* Unset placeholder */
.rdoc-dlg-unset-btn {
  background: none;
  border: 1px dashed #c8c8c8;
  border-radius: 3px;
  color: #b8b8b8;
  font-size: 13px;
  padding: 0 10px;
  height: 22px;
  cursor: pointer;
  line-height: 1;
}

.rdoc-dlg-unset-btn:hover {
  border-color: #909090;
  color: #909090;
}

/* Clear button */
.rdoc-dlg-clear {
  background: none;
  border: none;
  color: #c0c0c0;
  font-size: 15px;
  padding: 0 3px;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
}

.rdoc-dlg-clear:hover {
  color: #c0392b;
}

/* Inputs and selects */
.rdoc-dlg-input,
.rdoc-dlg-select {
  background: #fff;
  border: 1px solid #c8c8c8;
  border-radius: 3px;
  color: #1a1a1a;
  font-size: 11px;
  padding: 2px 4px;
  height: 22px;
  outline: none;
  box-sizing: border-box;
}

.rdoc-dlg-input:focus,
.rdoc-dlg-select:focus {
  border-color: hsl(220 80% 52%);
}

.rdoc-dlg-input--num {
  width: 52px;
  text-align: right;
}

.rdoc-dlg-input--text {
  flex: 1;
  min-width: 0;
}

.rdoc-dlg-unit {
  font-size: 10px;
  color: #9a9a9a;
  white-space: nowrap;
}

/* Inline control groups */
.rdoc-dlg-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Two-state toggle (e.g. Italic / Normal) */
.rdoc-dlg-toggle {
  display: flex;
  border: 1px solid #c8c8c8;
  border-radius: 3px;
  overflow: hidden;
}

.rdoc-dlg-toggle-btn {
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 11px;
  padding: 2px 10px;
  cursor: pointer;
  height: 22px;
}

.rdoc-dlg-toggle-btn + .rdoc-dlg-toggle-btn {
  border-left: 1px solid #c8c8c8;
}

.rdoc-dlg-toggle-btn--active {
  background: hsl(220 80% 52%);
  color: #fff;
}

/* Footer */
.rdoc-dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.rdoc-dlg-btn {
  border-radius: 4px;
  font-size: 12px;
  padding: 5px 16px;
  cursor: pointer;
  border: 1px solid transparent;
}

.rdoc-dlg-btn--cancel {
  background: #f0f0f0;
  border-color: #c8c8c8;
  color: #1a1a1a;
}

.rdoc-dlg-btn--cancel:hover {
  background: #e4e4e4;
}

.rdoc-dlg-btn--commit {
  background: hsl(220 80% 52%);
  color: #fff;
  border-color: hsl(220 80% 46%);
}

.rdoc-dlg-btn--commit:hover {
  background: hsl(220 80% 46%);
}

/* Close button (live dialogs) */
.rdoc-dlg-btn--close {
  background: #f0f0f0;
  border-color: #c8c8c8;
  color: #1a1a1a;
  margin-left: auto;
}

.rdoc-dlg-btn--close:hover {
  background: #e4e4e4;
}

/* Markdown editor dialog */
.rdoc-dlg-md-textarea {
  width: 100%;
  min-height: 240px;
  resize: vertical;
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #1a1a1a;
  background: #fff;
  border: 1px solid #c8c8c8;
  border-radius: 3px;
  padding: 8px;
  box-sizing: border-box;
  outline: none;
  white-space: pre-wrap;
  tab-size: 2;
}

.rdoc-dlg-md-textarea:focus {
  border-color: hsl(220 80% 52%);
}

/* Anchor picker dialog */
.rdoc-ap-body {
  padding: 6px 0;
  min-height: 180px;
}

.rdoc-ap-group-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a8a8a;
  padding: 8px 14px 3px;
}

.rdoc-ap-row {
  padding: 5px 14px;
  cursor: pointer;
  font-size: 12px;
  color: #1a1a1a;
  border-radius: 3px;
  margin: 0 6px;
  outline: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rdoc-ap-row:hover {
  background: rgba(0, 0, 0, 0.04);
}

.rdoc-ap-row:focus-visible {
  box-shadow: 0 0 0 2px hsl(220 80% 52%);
}

.rdoc-ap-row--indented {
  padding-left: 28px;
}

.rdoc-ap-row--selected {
  background: hsl(220 80% 94%);
  color: hsl(220 80% 32%);
}

.rdoc-ap-row--selected:hover {
  background: hsl(220 80% 90%);
}

/* Named styles dialog */
.rdoc-dlg-box--wide {
  min-width: 680px;
  max-width: 860px;
}

.rdoc-dlg-ns-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.rdoc-dlg-ns-sidebar {
  flex: 0 0 180px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rdoc-dlg-ns-group {
  padding: 0 10px;
}

.rdoc-dlg-ns-group + .rdoc-dlg-ns-group {
  border-top: 1px solid #ebebeb;
  margin-top: 8px;
  padding-top: 8px;
}

.rdoc-dlg-ns-group-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a8a8a;
  margin: 0 0 4px;
}

.rdoc-dlg-ns-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 6px;
}

.rdoc-dlg-ns-item {
  display: flex;
  align-items: center;
  border-radius: 3px;
  padding: 0 2px;
}

.rdoc-dlg-ns-item--selected {
  background: hsl(220 80% 94%);
}

.rdoc-dlg-ns-item-label {
  flex: 1;
  text-align: left;
  background: none;
  border: none;
  font-size: 12px;
  color: #1a1a1a;
  padding: 4px 4px;
  cursor: pointer;
  border-radius: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rdoc-dlg-ns-item-label:hover {
  background: rgba(0, 0, 0, 0.04);
}

.rdoc-dlg-ns-item--selected .rdoc-dlg-ns-item-label:hover {
  background: hsl(220 80% 90%);
}

.rdoc-dlg-ns-item-delete {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #c0c0c0;
  font-size: 15px;
  width: 20px;
  height: 20px;
  padding: 0;
  cursor: pointer;
  line-height: 1;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rdoc-dlg-ns-item-delete:hover:not(:disabled) {
  color: #c0392b;
  background: rgba(192, 57, 43, 0.08);
}

.rdoc-dlg-ns-item-delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.rdoc-dlg-ns-add {
  background: none;
  border: 1px dashed #c8c8c8;
  border-radius: 3px;
  color: #8a8a8a;
  font-size: 11px;
  padding: 3px 8px;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.rdoc-dlg-ns-add:hover {
  border-color: #909090;
  color: #333;
}

/* Detail pane */
.rdoc-dlg-ns-detail {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.rdoc-dlg-ns-empty {
  font-size: 12px;
  color: #b8b8b8;
  font-style: italic;
  margin: auto;
  text-align: center;
}

.rdoc-dlg-ns-detail-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.rdoc-dlg-ns-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.rdoc-dlg-ns-name-row .rdoc-dlg-input {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  height: 26px;
}

.rdoc-dlg-ns-name-error {
  font-size: 11px;
  color: #c0392b;
  flex-shrink: 0;
}

.rdoc-dlg-ns-props-divider {
  border-top: 1px solid #ebebeb;
  margin-bottom: 10px;
}

.rdoc-dlg-ns-props {
  display: flex;
  flex-direction: column;
}
`;

const INJECTED_ATTR = "data-rippledoc-dialog-styles";

export function injectDialogStyles(): void {
  if (document.querySelector(`[${INJECTED_ATTR}]`)) return;
  const style = document.createElement("style");
  style.setAttribute(INJECTED_ATTR, "");
  style.textContent = DIALOG_CSS;
  document.head.appendChild(style);
}
