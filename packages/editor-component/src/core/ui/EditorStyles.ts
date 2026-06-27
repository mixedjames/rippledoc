const EDITOR_CSS = `
.rippledoc-editor {
  --re-sidebar-width: 240px;
  --re-sidebar-bg: #f5f5f5;
  --re-sidebar-fg: #1a1a1a;
  --re-panel-header-bg: #ebebeb;
  --re-panel-header-hover-bg: #e0e0e0;
  --re-panel-header-fg: #1a1a1a;
  --re-panel-border: #d4d4d4;
  --re-panel-body-bg: #f5f5f5;
  --re-panel-body-fg: #1a1a1a;
  --re-panel-empty-fg: #8a8a8a;
  --re-input-bg: #ffffff;
  --re-input-fg: #1a1a1a;
  --re-input-border: #c0c0c0;

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
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--re-panel-border);
}

.re-panel {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  border-bottom: 1px solid var(--re-panel-border);
}

.re-panel--open {
  flex: 1 1 0;
  min-height: 0;
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
  /* default (closed): arrow points right */
  transform: rotate(-90deg);
}

.re-panel--open .re-panel__toggle {
  transform: rotate(0deg);
}

.re-panel__body {
  padding: 8px;
  background: var(--re-panel-body-bg);
  color: var(--re-panel-body-fg);
  font-size: 12px;
  display: none;
}

.re-panel--open .re-panel__body {
  display: block;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.re-panel-empty {
  color: var(--re-panel-empty-fg);
  font-style: italic;
}

.re-panel-label {
  font-size: 11px;
  color: var(--re-panel-empty-fg);
  margin-bottom: 6px;
}

.re-panel-action-btn {
  display: block;
  width: 100%;
  padding: 5px 8px;
  background: var(--re-input-bg);
  border: 1px solid var(--re-input-border);
  border-radius: 3px;
  font-size: 11px;
  color: var(--re-input-fg);
  text-align: left;
  cursor: pointer;
}

.re-panel-action-btn:hover {
  background: #f0f0f0;
  border-color: #999;
}

/* ── Properties panel ────────────────────────────────────────────────────── */

.re-prop-error {
  font-size: 10px;
  color: #c0392b;
  margin-top: 2px;
  padding: 0 2px;
}

.re-prop-src {
  font-size: 10px;
  font-family: monospace;
  color: var(--re-panel-empty-fg);
  background: var(--re-input-bg);
  border: 1px solid var(--re-panel-border);
  border-radius: 2px;
  padding: 2px 4px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  display: flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--re-panel-empty-fg);
  margin-bottom: 6px;
}

.re-style-clear {
  margin-left: auto;
  padding: 0 4px;
  background: none;
  border: none;
  color: var(--re-panel-empty-fg);
  font-size: 9px;
  font-style: italic;
  font-weight: normal;
  text-transform: none;
  letter-spacing: 0;
  cursor: pointer;
  border-radius: 2px;
  line-height: 14px;
}

.re-style-clear:hover {
  color: var(--re-panel-header-fg);
  background: var(--re-panel-header-hover-bg);
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
  border-color: hsl(220 80% 52%);
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

/* Source-level badge — appears in section titles and between row label and value. */
.re-style-source {
  font-weight: normal;
  font-size: 9px;
  font-style: italic;
  text-transform: none;
  letter-spacing: 0;
  color: #aaa;
  margin-left: 4px;
}

.re-style-source--row {
  flex-shrink: 0;
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 0;
}

/* ── Named style tags (Styles panel) ──────────────────────────────────────── */

.re-style-named-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.re-style-named-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 4px 2px 7px;
  background: #d4e4ff;
  color: #1a3a6b;
  border: 1px solid #a8c4f0;
  border-radius: 10px;
  font-size: 10px;
  max-width: 100%;
}

.re-style-named-tag--partial {
  background: #eaeaea;
  color: #666;
  border-color: #ccc;
  font-style: italic;
}

.re-style-named-tag__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.re-style-named-tag__remove {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font-size: 13px;
  font-style: normal;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
}

.re-style-named-tag__remove:hover {
  opacity: 1;
}

.re-style-named-add {
  width: 100%;
  margin-top: 2px;
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

.re-anchor-row--current {
  background: var(--re-panel-header-bg);
  border-radius: 2px;
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

.re-anchor-repick {
  padding: 0 4px;
  background: none;
  border: 1px solid var(--re-panel-border);
  border-radius: 3px;
  color: var(--re-sidebar-fg);
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
}

.re-anchor-repick:hover {
  border-color: var(--re-sidebar-fg);
  color: #ffffff;
}

.re-anchor-pick-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 0;
}

.re-anchor-pick-btn {
  padding: 5px 8px;
  background: none;
  border: 1px solid var(--re-panel-border);
  border-radius: 3px;
  color: var(--re-sidebar-fg);
  font-size: 11px;
  cursor: pointer;
  text-align: left;
}

.re-anchor-pick-btn:hover {
  border-color: var(--re-sidebar-fg);
  color: #ffffff;
}

/* ── Animations panel ─────────────────────────────────────────────────────── */

.re-anim-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  min-height: 22px;
  font-size: 11px;
  border-radius: 2px;
}

.re-anim-row__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  min-width: 0;
}

.re-anim-row__info:hover {
  background: var(--re-panel-header-hover-bg);
}

.re-anim-row__trigger {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.re-anim-row__meta {
  font-size: 10px;
  color: var(--re-panel-empty-fg);
}

.re-anim-remove {
  flex-shrink: 0;
  padding: 0 4px;
  background: none;
  border: none;
  color: var(--re-panel-empty-fg);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  border-radius: 2px;
}

.re-anim-remove:hover {
  color: var(--re-sidebar-fg);
  background: var(--re-panel-header-hover-bg);
}

.re-anim-add-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  border-top: 1px solid var(--re-panel-border);
  padding-top: 8px;
}

.re-anim-mode-btn {
  flex: 1;
  padding: 2px 6px;
  background: var(--re-input-bg);
  border: 1px solid var(--re-input-border);
  border-radius: 2px;
  font-size: 11px;
  color: var(--re-input-fg);
  cursor: pointer;
  text-align: left;
}

.re-anim-mode-btn:hover {
  border-color: #999;
}

.re-anim-unit {
  font-size: 10px;
  color: var(--re-panel-empty-fg);
}

.re-anim-stub {
  font-size: 10px;
  color: var(--re-panel-empty-fg);
  font-style: italic;
}

.re-anim-remove-btn {
  margin-top: 12px;
  color: #c0392b;
  border-color: #e0a0a0;
}

.re-anim-remove-btn:hover {
  background: #ffeaea;
  border-color: #c0392b;
}

/* ── Keyframe editor ──────────────────────────────────────────────────────── */

.re-kf-section {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--re-panel-border);
}

.re-kf-section .re-anchor-row__name {
  flex: 1;
}

.re-kf-count {
  font-size: 10px;
  color: var(--re-panel-empty-fg);
}

.re-kf-add-btn {
  padding: 1px 5px;
  background: none;
  border: 1px solid var(--re-input-border);
  border-radius: 2px;
  font-size: 10px;
  color: var(--re-panel-empty-fg);
  cursor: pointer;
}

.re-kf-add-btn:hover {
  border-color: var(--re-sidebar-fg);
  color: var(--re-sidebar-fg);
}

.re-kf-row {
  margin-bottom: 2px;
  border: 1px solid var(--re-panel-border);
  border-radius: 2px;
}

.re-kf-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  cursor: pointer;
  font-size: 11px;
  min-height: 20px;
}

.re-kf-summary:hover {
  background: var(--re-panel-header-hover-bg);
}

.re-kf-arrow {
  font-size: 8px;
  color: var(--re-panel-empty-fg);
  width: 10px;
  flex-shrink: 0;
}

.re-kf-pos {
  font-weight: 500;
  flex-shrink: 0;
}

.re-kf-props-summary {
  flex: 1;
  font-size: 10px;
  color: var(--re-panel-empty-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.re-kf-detail {
  padding: 4px 6px 6px 6px;
  border-top: 1px solid var(--re-panel-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.re-kf-transform-header {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.re-transform-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.re-transform-step {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 1px 0;
}

.re-transform-step__type {
  width: 52px;
  flex-shrink: 0;
  color: var(--re-panel-empty-fg);
  font-size: 10px;
}

.re-transform-step__vals {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.re-transform-step__controls {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.re-kf-step-btn {
  padding: 0 3px;
  background: none;
  border: none;
  color: var(--re-panel-empty-fg);
  font-size: 11px;
  cursor: pointer;
  border-radius: 2px;
  line-height: 1.4;
}

.re-kf-step-btn:hover {
  color: var(--re-sidebar-fg);
  background: var(--re-panel-header-hover-bg);
}

.re-step-input-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
}

.re-step-input-label {
  font-size: 10px;
  color: var(--re-panel-empty-fg);
}

.re-step-input {
  width: 48px !important;
}

.re-transform-add {
  display: flex;
  gap: 4px;
  margin-top: 2px;
  padding-left: 54px;
}
`;

const INJECTED_ATTR = "data-rippledoc-editor-styles";

/**
 * Injects the editor's CSS into `<head>` exactly once per document, regardless
 * of how many editor instances exist. The attribute guard prevents double-injection
 * in environments that construct multiple editors (tests, demos).
 *
 * All editor styles use the `re-` (rippledoc-editor) prefix and are scoped under
 * `.rippledoc-editor` for the layout/canvas rules. CSS custom properties on
 * `.rippledoc-editor` expose the colour tokens so a future theming layer can
 * override them without touching the selector rules.
 */
export function injectEditorStyles(): void {
  if (document.querySelector(`[${INJECTED_ATTR}]`)) return;
  const style = document.createElement("style");
  style.setAttribute(INJECTED_ATTR, "");
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}
