import {
  createPresentation,
  constant,
  offsetFrom,
  fractionOf,
} from "@rippledoc/presentation4";
import type { AnchorExpression, Section, ScrollTrigger, Element } from "@rippledoc/presentation4";
import { createEditorView } from "@rippledoc/view-editor";
import type { ViewMode } from "@rippledoc/view-editor";

// ── Presentation ──────────────────────────────────────────────────────────────

const presentation = createPresentation({ basisWidth: 1000, basisHeight: 800 });

// ── Sections ──────────────────────────────────────────────────────────────────

const vh = presentation.root.viewportHeight;

const s1 = presentation.root.addSection();
s1.setVerticalAnchors({ top: constant(0), height: offsetFrom(vh, 0) });

const s2 = presentation.root.addSection();
s2.setVerticalAnchors({ top: offsetFrom(s1.anchors.bottom, 0), height: offsetFrom(vh, 0) });

const s3 = presentation.root.addSection();
s3.setVerticalAnchors({ top: offsetFrom(s2.anchors.bottom, 0), height: offsetFrom(vh, 0) });

const s4 = presentation.root.addSection();
s4.setVerticalAnchors({ top: offsetFrom(s3.anchors.bottom, 0), height: offsetFrom(vh, 0) });

// ── Elements ──────────────────────────────────────────────────────────────────

const GAP = 20;
const MARGIN = 60;
const CONTENT_WIDTH = 880;

function addText(
  section: Section,
  text: string,
  top: AnchorExpression,
  left = MARGIN,
  width = CONTENT_WIDTH,
) {
  const el = section.addMarkdownElement(text);
  el.setHorizontalAnchors({ left: constant(left), width: constant(width) });
  el.setAutoHeight({ top });
  return el;
}

// s1
const s1Title = addText(s1, "# Section 1 — Intro", offsetFrom(s1.anchors.top, 30));
const s1Body = addText(
  s1,
  "Scroll down to move through the four sections. Each trigger zone is shown in the panel on the right.",
  offsetFrom(s1Title.anchors.bottom, GAP),
);
addText(s1, "Another element further down Section 1.", offsetFrom(s1Body.anchors.bottom, 200));

// s2
const s2Title = addText(s2, "## Section 2 — Chapter 1", offsetFrom(s2.anchors.top, 30));
addText(
  s2,
  "The SVG to the right is pinned — it stays on screen while Section 3 scrolls by.",
  offsetFrom(s2Title.anchors.bottom, GAP),
);

// Pinned SVG: positioned right-of-centre in s2. Pin trigger starts at the
// element's own top so the clone appears at the top of the viewport when
// pinning begins.
const SVG_TOP_OFFSET = 200;
const SVG_LEFT = 550;
const SVG_SIZE = 300;

const svgEl = s2.addSVGImageElement();
svgEl.setSrc("img/test.svg");
svgEl.setHorizontalAnchors({ left: constant(SVG_LEFT), width: constant(SVG_SIZE) });
svgEl.setVerticalAnchors({
  top: offsetFrom(s2.anchors.top, SVG_TOP_OFFSET),
  height: constant(SVG_SIZE),
});

// s3
const s3Title = addText(s3, "## Section 3", offsetFrom(s3.anchors.top, 30));
addText(
  s3,
  "This section scrolls normally while the SVG from Section 2 is pinned at the top of the screen.",
  offsetFrom(s3Title.anchors.bottom, GAP),
);

// s4
const s4Title = addText(s4, "## Section 4 — Outro", offsetFrom(s4.anchors.top, 30));
addText(s4, "End of presentation.", offsetFrom(s4Title.anchors.bottom, GAP));

// ── Scroll triggers ───────────────────────────────────────────────────────────

const triggerA = presentation.addScrollTrigger({
  name: "A — Intro fade",
  top: fractionOf(vh, 0.3),
  height: fractionOf(vh, 0.7),
});

const triggerB = presentation.addScrollTrigger({
  name: "B — Chapter 1",
  top: offsetFrom(s2.anchors.top, 0),
  height: offsetFrom(s2.anchors.height, 0),
});

const triggerC = presentation.addScrollTrigger({
  name: "C — Outro",
  top: offsetFrom(s4.anchors.top, 0),
  height: offsetFrom(vh, 0),
});

// Pin trigger: top matches the SVG element's top so the clone appears at the
// top of the viewport the moment pinning begins. Spans all of s3.
const triggerPin = presentation.addScrollTrigger({
  name: "Pin — SVG through s3",
  top: offsetFrom(s2.anchors.top, SVG_TOP_OFFSET),
  height: offsetFrom(s3.anchors.height, 0),
});

svgEl.animations.addPin(triggerPin);

// ── Editor view ───────────────────────────────────────────────────────────────

const editor = createEditorView({ container: "#theContainer" });
presentation.attachView(editor.viewFactory);

// ── Mode switcher ─────────────────────────────────────────────────────────────

const modeButtonIds: Record<ViewMode, string> = {
  editor: "modeEditor",
  anchors: "modeAnchors",
  player: "modePlayer",
};

function setMode(mode: ViewMode): void {
  editor.setMode(mode);
  for (const [m, id] of Object.entries(modeButtonIds)) {
    const btn = document.getElementById(id)!;
    btn.dataset.active = String(m === mode);
  }
}

for (const [mode, id] of Object.entries(modeButtonIds)) {
  document.getElementById(id)!.addEventListener("click", () =>
    setMode(mode as ViewMode),
  );
}
setMode("editor");

// ── Selection display ─────────────────────────────────────────────────────────

const selectionCount = document.getElementById("selectionCount")!;
const selectionList = document.getElementById("selectionList")!;

function describeElement(el: Element): string {
  if ("markdown" in el) {
    const text = (el as { markdown: string }).markdown
      .replace(/^#+\s*/, "")
      .replace(/\n.*/s, "")
      .slice(0, 50);
    return `Markdown — "${text}"`;
  }
  if ("alt" in el) return "Bitmap image";
  return "SVG image";
}

function refreshSelectionPanel(): void {
  const elements = [...editor.selection.elements];
  selectionCount.textContent = String(elements.length);
  selectionList.replaceChildren();

  if (elements.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sel-empty";
    empty.textContent = "nothing selected — click an element";
    selectionList.appendChild(empty);
    return;
  }

  for (const el of elements) {
    const item = document.createElement("div");
    item.className = "sel-item";
    item.textContent = describeElement(el);
    selectionList.appendChild(item);
  }
}

refreshSelectionPanel();
editor.events.on("selection:changed", refreshSelectionPanel);

// ── Picking ───────────────────────────────────────────────────────────────────

editor.events.on("element:picked", ({ element, source }) => {
  if (source.shiftKey) {
    editor.selection.add(element);
  } else {
    editor.selection.set([element]);
  }
});

editor.events.on("key:down", ({ source }) => {
  if (source.key === "Escape") editor.selection.clear();
});

// ── Serialisation ─────────────────────────────────────────────────────────────

document.getElementById("btnLogMemento")!.addEventListener("click", () => {
  console.log(presentation.toMemento());
});

// ── Trigger HUD ───────────────────────────────────────────────────────────────

type TriggerState = { label: HTMLElement; bar: HTMLElement; pill: HTMLElement };

function bindTriggerHUD(
  trigger: ScrollTrigger,
  stateEl: HTMLElement,
  barEl: HTMLElement,
  pillEl: HTMLElement,
): TriggerState {
  const s: TriggerState = { label: stateEl, bar: barEl, pill: pillEl };

  function update(state: "BEFORE" | "ACTIVE" | "AFTER", progress: number) {
    s.label.textContent = state;
    s.label.dataset["state"] = state;
    s.bar.style.width = `${Math.round(progress * 100)}%`;
    s.pill.textContent = `${Math.round(progress * 100)}%`;
  }

  trigger.on("start", ({ progress }) => update("ACTIVE", progress));
  trigger.on("scroll", ({ progress }) => update("ACTIVE", progress));
  trigger.on("end", ({ progress }) => update("AFTER", progress));
  trigger.on("reverseStart", ({ progress }) => update("ACTIVE", progress));
  trigger.on("reverseEnd", ({ progress }) => update("BEFORE", progress));

  update("BEFORE", 0);
  return s;
}

function buildHUDRow(hud: HTMLElement, trigger: ScrollTrigger): void {
  const row = document.createElement("div");
  row.className = "trigger-row";

  const nameEl = document.createElement("div");
  nameEl.className = "trigger-name";
  nameEl.textContent = trigger.name;

  const stateEl = document.createElement("span");
  stateEl.className = "trigger-state";

  const barTrack = document.createElement("div");
  barTrack.className = "trigger-bar-track";

  const barFill = document.createElement("div");
  barFill.className = "trigger-bar-fill";
  barTrack.appendChild(barFill);

  const pill = document.createElement("span");
  pill.className = "trigger-pill";

  row.appendChild(nameEl);
  const meta = document.createElement("div");
  meta.className = "trigger-meta";
  meta.appendChild(stateEl);
  meta.appendChild(pill);
  row.appendChild(meta);
  row.appendChild(barTrack);
  hud.appendChild(row);

  bindTriggerHUD(trigger, stateEl, barFill, pill);
}

const hud = document.getElementById("triggerHUD")!;
buildHUDRow(hud, triggerA);
buildHUDRow(hud, triggerB);
buildHUDRow(hud, triggerC);
buildHUDRow(hud, triggerPin);
