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
`;

const INJECTED_ATTR = "data-rippledoc-dialog-styles";

export function injectDialogStyles(): void {
  if (document.querySelector(`[${INJECTED_ATTR}]`)) return;
  const style = document.createElement("style");
  style.setAttribute(INJECTED_ATTR, "");
  style.textContent = DIALOG_CSS;
  document.head.appendChild(style);
}
