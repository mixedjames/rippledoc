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
  type ScrollTrigger,
} from "@rippledoc/presentation4";
import { createDialogs, type OperationSink } from "@rippledoc/dialogs";

// ── Delegate ──────────────────────────────────────────────────────────────────

const delegate: EditorDelegate = {
  requestImageImport() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,.svg";
      input.addEventListener(
        "change",
        () => {
          const file = input.files?.[0];
          resolve(file ? { src: URL.createObjectURL(file) } : null);
        },
        { once: true },
      );
      window.addEventListener(
        "focus",
        () => {
          if (!input.files?.length) resolve(null);
        },
        { once: true, capture: true },
      );
      input.click();
    });
  },
  async requestMarkdownEdit(element) {
    await dialogs.openMarkdownEditor(element);
  },
  async requestConfirm(message) {
    return window.confirm(message);
  },
  async requestAnchorPick(presentation) {
    const result = await dialogs.openAnchorPicker(presentation);
    return result.committed ? result.value : null;
  },
};

// ── Editor component ──────────────────────────────────────────────────────────

const editor = createEditorComponent(delegate);
document.getElementById("editorMount")!.appendChild(editor.element);

type PlayToggle = { setViewMode(mode: "editor" | "player"): void };
const editorImpl = editor as unknown as PlayToggle;

// ── Dialogs ───────────────────────────────────────────────────────────────────

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
const btnPlay = document.getElementById("btnPlay")! as HTMLButtonElement;

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
let playerMode = false;

btnPlay.addEventListener("click", () => {
  playerMode = !playerMode;
  editorImpl.setViewMode(playerMode ? "player" : "editor");
  btnPlay.textContent = playerMode ? "Edit" : "Play";
  btnPlay.dataset.active = String(playerMode);
});

btnNew.addEventListener("click", () => {
  playerMode = false;
  btnPlay.textContent = "Play";
  btnPlay.dataset.active = "false";
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

  const animBox = s1.addMarkdownElement(
    "**Animated element** — scroll to reveal in player mode.",
  );
  animBox.setHorizontalAnchors({ left: constant(60), width: constant(500) });
  animBox.setVerticalAnchors({
    top: offsetFrom(s1.anchors.top, 200),
    height: constant(80),
  });

  const demoImg = s1.addBitmapImageElement();
  demoImg.setSrc(
    "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">' +
          '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#4488ff"/>' +
          '<stop offset="1" stop-color="#44ddaa"/>' +
          "</linearGradient></defs>" +
          '<rect width="300" height="200" fill="url(#g)" rx="8"/>' +
          '<text x="150" y="108" text-anchor="middle" fill="white" ' +
          'font-family="sans-serif" font-size="20">Image element</text>' +
          "</svg>",
      ),
  );
  demoImg.setAlt("Demo gradient image");
  demoImg.setObjectFit("contain");
  demoImg.setHorizontalAnchors({ left: constant(700), width: constant(300) });
  demoImg.setVerticalAnchors({
    top: offsetFrom(s1.anchors.top, 40),
    height: constant(200),
  });

  const s2title = s2.addMarkdownElement("## Section Two");
  s2title.setHorizontalAnchors({ left: constant(60), width: constant(600) });
  s2title.setAutoHeight({ top: offsetFrom(s2.anchors.top, 40) });

  const s2body = s2.addMarkdownElement(
    "A demo paragraph for the second section. Click me to select.",
  );
  s2body.setHorizontalAnchors({ left: constant(60), width: constant(600) });
  s2body.setAutoHeight({ top: offsetFrom(s2title.anchors.bottom, 20) });

  const headingFocusTrigger: ScrollTrigger = p.addScrollTrigger({
    name: "Heading Focus",
    top: offsetFrom(s1.anchors.top, 0),
    bottom: offsetFrom(s1.anchors.top, 400),
  });
  p.addScrollTrigger({
    name: "Crossfade",
    top: offsetFrom(s1.anchors.bottom, -200),
    bottom: offsetFrom(s2.anchors.top, 200),
  });
  p.addScrollTrigger({
    name: "Second Section",
    top: offsetFrom(s2.anchors.top, 0),
    bottom: offsetFrom(s2.anchors.bottom, 0),
  });

  animBox.animations.addKeyFrameAnimation({
    trigger: headingFocusTrigger,
    duration: 1000,
    scrollDriven: true,
    keyFrames: [
      { position: 0, opacity: 0, transform: [{ type: "translate", y: 30 }] },
      { position: 1000, opacity: 1, transform: [{ type: "translate", y: 0 }] },
    ],
  });
}

// ── Initial state ─────────────────────────────────────────────────────────────

seedPresentation(currentPresentation);
refreshToolbar();
btnSingleSelect.dataset.active = "true";
