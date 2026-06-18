const EDITOR_CSS = `
.rippledoc-editor {
  --re-sidebar-width: 240px;
  --re-sidebar-bg: #1e1e1e;
  --re-sidebar-fg: #cccccc;
  --re-panel-header-bg: #252526;
  --re-panel-header-hover-bg: #2d2d2d;
  --re-panel-header-fg: #cccccc;
  --re-panel-border: #3e3e42;
  --re-panel-body-bg: #1e1e1e;
  --re-panel-body-fg: #cccccc;
  --re-panel-empty-fg: #6b6b6b;
  --re-input-bg: #3c3c3c;
  --re-input-fg: #cccccc;
  --re-input-border: #5a5a5a;

  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.rippledoc-editor__canvas {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.re-sidebar {
  width: var(--re-sidebar-width);
  flex-shrink: 0;
  background: var(--re-sidebar-bg);
  color: var(--re-sidebar-fg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--re-panel-border);
}

.re-panel {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--re-panel-border);
}

.re-panel__header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
  background: var(--re-panel-header-bg);
  color: var(--re-panel-header-fg);
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
}

.re-panel__header:hover {
  background: var(--re-panel-header-hover-bg);
}

.re-panel__title {
  flex: 1;
}

.re-panel__toggle {
  display: inline-block;
  font-style: normal;
  transition: transform 0.15s ease;
}

.re-panel--collapsed .re-panel__toggle {
  transform: rotate(-90deg);
}

.re-panel__body {
  padding: 8px;
  background: var(--re-panel-body-bg);
  color: var(--re-panel-body-fg);
  font-size: 12px;
}

.re-panel--collapsed .re-panel__body {
  display: none;
}

.re-panel-empty {
  color: var(--re-panel-empty-fg);
  font-style: italic;
}

/* ── Styles panel ─────────────────────────────────────────────────────────── */

.re-style-section {
  margin-bottom: 8px;
}

.re-style-section + .re-style-section {
  border-top: 1px solid var(--re-panel-border);
  padding-top: 8px;
}

.re-style-section__title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--re-panel-empty-fg);
  margin-bottom: 6px;
}

.re-style-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  min-height: 20px;
}

.re-style-row__label {
  flex: 0 0 48px;
  font-size: 10px;
  color: var(--re-panel-empty-fg);
}

.re-style-row__value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.re-style-input,
.re-style-select {
  background: var(--re-input-bg);
  border: 1px solid var(--re-input-border);
  color: var(--re-input-fg);
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 2px;
  outline: none;
}

.re-style-input:focus,
.re-style-select:focus {
  border-color: #4d94ff;
}

.re-style-input--hex {
  width: 72px;
  font-family: monospace;
}

.re-style-input--number {
  width: 48px;
}

.re-style-input--text {
  flex: 1;
  min-width: 0;
}

.re-style-swatch {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid var(--re-input-border);
}

.re-style-check {
  cursor: pointer;
}

/* ── Anchors panel ─────────────────────────────────────────────────────────── */

.re-anchor-group {
  margin-bottom: 8px;
}

.re-anchor-group + .re-anchor-group {
  border-top: 1px solid var(--re-panel-border);
  padding-top: 8px;
}

.re-anchor-group__title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--re-panel-empty-fg);
  margin-bottom: 6px;
}

.re-anchor-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
  min-height: 20px;
  font-size: 11px;
}

.re-anchor-row--locked {
  opacity: 0.45;
}

.re-anchor-row--clickable {
  cursor: pointer;
  border-radius: 2px;
}

.re-anchor-row--clickable:hover {
  background: var(--re-panel-header-hover-bg);
}

.re-anchor-row__name {
  flex: 0 0 44px;
  font-size: 10px;
  color: var(--re-panel-empty-fg);
}

.re-anchor-row__value {
  flex: 0 0 52px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.re-anchor-row__expr {
  flex: 1;
  font-size: 10px;
  color: var(--re-panel-empty-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.re-anchor-back {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  margin-bottom: 6px;
  background: none;
  border: none;
  color: var(--re-sidebar-fg);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.re-anchor-back:hover {
  color: #ffffff;
}

.re-anchor-detail-divider {
  border: none;
  border-top: 1px solid var(--re-panel-border);
  margin-bottom: 8px;
}

.re-anchor-edit-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}

.re-anchor-select {
  flex: 1;
}
`;

const INJECTED_ATTR = "data-rippledoc-editor-styles";

export function injectEditorStyles(): void {
  if (document.querySelector(`[${INJECTED_ATTR}]`)) return;
  const style = document.createElement("style");
  style.setAttribute(INJECTED_ATTR, "");
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}
