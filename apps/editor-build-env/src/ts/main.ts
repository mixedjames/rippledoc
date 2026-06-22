import {
  createEditorComponent,
  type EditorDelegate,
  type EditorCommandId,
  type EditorToolId,
} from "@rippledoc/editor-component";
import {
  constant,
  offsetFrom,
  type Presentation,
} from "@rippledoc/presentation4";
import { createDialogs, type OperationSink } from "@rippledoc/dialogs";

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

// ── Dialogs ───────────────────────────────────────────────────────────────────

// No-op sink: dialog changes apply immediately but aren't yet tracked in
// undo/redo history. editor-component needs to expose pushOperation() in its
// clientAPI before this can be properly wired.
const sink: OperationSink = { push() {} };
const dialogs = createDialogs(document.body, sink);

let currentPresentation: Presentation = editor.newPresentation();

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
const btnGlobalStyles = document.getElementById(
  "btnGlobalStyles",
)! as HTMLButtonElement;
const btnNamedStyles = document.getElementById(
  "btnNamedStyles",
)! as HTMLButtonElement;

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
btnNew.addEventListener("click", () => {
  currentPresentation = editor.newPresentation();
  seedPresentation(currentPresentation);
});

btnGlobalStyles.addEventListener("click", () => {
  void dialogs.openGlobalStyles(currentPresentation.styles);
});

btnNamedStyles.addEventListener("click", () => {
  void dialogs.openNamedStyles(currentPresentation);
});

const selectionStatus = document.getElementById(
  "selectionStatus",
)! as HTMLSpanElement;

function refreshSelectionStatus({
  elements,
  sections,
}: {
  elements: ReadonlySet<unknown>;
  sections: ReadonlySet<unknown>;
}): void {
  if (elements.size > 0) {
    selectionStatus.textContent = `${elements.size} element${elements.size === 1 ? "" : "s"} selected`;
  } else if (sections.size > 0) {
    selectionStatus.textContent = `${sections.size} section${sections.size === 1 ? "" : "s"} selected`;
  } else {
    selectionStatus.textContent = "Nothing selected";
  }
}

editor.events.on("selectionChanged", refreshSelectionStatus);
editor.events.on("commandStateChanged", refreshToolbar);

editor.events.on("toolChanged", ({ tool }) => {
  for (const [id, btn] of Object.entries(toolButtons)) {
    btn.dataset.active = String(id === tool);
  }
});

// ── Demo content ─────────────────────────────────────────────────────────────

function seedPresentation(p: Presentation): void {
  const vh = p.root.viewportHeight;

  const s1 = p.root.addSection();
  s1.setVerticalAnchors({ top: constant(0), height: offsetFrom(vh, 0) });

  const s2 = p.root.addSection();
  s2.setVerticalAnchors({
    top: offsetFrom(s1.anchors.bottom, 0),
    height: offsetFrom(vh, 0),
  });

  const s1title = s1.addMarkdownElement("# Section One");
  s1title.setHorizontalAnchors({ left: constant(60), width: constant(600) });
  s1title.setAutoHeight({ top: offsetFrom(s1.anchors.top, 40) });

  const s1body = s1.addMarkdownElement(
    "A demo paragraph for the first section. Click me to select.",
  );
  s1body.setHorizontalAnchors({ left: constant(60), width: constant(600) });
  s1body.setAutoHeight({ top: offsetFrom(s1title.anchors.bottom, 20) });

  const s2title = s2.addMarkdownElement("## Section Two");
  s2title.setHorizontalAnchors({ left: constant(60), width: constant(600) });
  s2title.setAutoHeight({ top: offsetFrom(s2.anchors.top, 40) });

  const s2body = s2.addMarkdownElement(
    "A demo paragraph for the second section. Click me to select.",
  );
  s2body.setHorizontalAnchors({ left: constant(60), width: constant(600) });
  s2body.setAutoHeight({ top: offsetFrom(s2title.anchors.bottom, 20) });
}

// ── Initial state ─────────────────────────────────────────────────────────────

seedPresentation(currentPresentation);
refreshToolbar();
btnSingleSelect.dataset.active = "true";
