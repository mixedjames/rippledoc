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
`;

const INJECTED_ATTR = "data-rippledoc-editor-styles";

export function injectEditorStyles(): void {
  if (document.querySelector(`[${INJECTED_ATTR}]`)) return;
  const style = document.createElement("style");
  style.setAttribute(INJECTED_ATTR, "");
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}
