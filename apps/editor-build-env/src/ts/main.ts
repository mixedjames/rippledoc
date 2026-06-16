import {
  createEditorComponent,
  type EditorDelegate,
  type EditorCommandId,
  type EditorToolId,
} from "@rippledoc/editor-component";

// ── Delegate ──────────────────────────────────────────────────────────────────

const delegate: EditorDelegate = {
  async requestImageImport() {
    // TODO: wire up a file picker
    return null;
  },
  async requestTextEdit(current) {
    const result = window.prompt("Edit text:", current);
    return result ?? null;
  },
  async requestConfirm(message) {
    return window.confirm(message);
  },
};

// ── Editor component ──────────────────────────────────────────────────────────

const editor = createEditorComponent(delegate);
document.getElementById("editorMount")!.appendChild(editor.element);

// ── Toolbar wiring ────────────────────────────────────────────────────────────

const btnSingleSelect = document.getElementById(
  "btnSingleSelect",
)! as HTMLButtonElement;
const btnMultiSelect = document.getElementById(
  "btnMultiSelect",
)! as HTMLButtonElement;
const btnUndo = document.getElementById("btnUndo")! as HTMLButtonElement;
const btnRedo = document.getElementById("btnRedo")! as HTMLButtonElement;
const btnNew = document.getElementById("btnNew")! as HTMLButtonElement;

const toolButtons: Record<EditorToolId, HTMLButtonElement> = {
  singleSelect: btnSingleSelect,
  multiSelect: btnMultiSelect,
};

function refreshToolbar(): void {
  btnUndo.disabled = !editor.canExec("undo");
  btnRedo.disabled = !editor.canExec("redo");
}

function exec(command: EditorCommandId): void {
  editor.exec(command);
  refreshToolbar();
}

btnSingleSelect.addEventListener("click", () => exec("tool:singleSelect"));
btnMultiSelect.addEventListener("click", () => exec("tool:multiSelect"));
btnUndo.addEventListener("click", () => exec("undo"));
btnRedo.addEventListener("click", () => exec("redo"));
btnNew.addEventListener("click", () => editor.newPresentation());

editor.events.on("commandStateChanged", refreshToolbar);

editor.events.on("toolChanged", ({ tool }) => {
  for (const [id, btn] of Object.entries(toolButtons)) {
    btn.dataset.active = String(id === tool);
  }
});

// ── Initial state ─────────────────────────────────────────────────────────────

editor.newPresentation();
refreshToolbar();
btnSingleSelect.dataset.active = "true";
