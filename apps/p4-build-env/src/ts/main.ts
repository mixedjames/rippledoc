import {
  createPresentation,
  constant,
  offsetFrom,
  fractionOf,
} from "@rippledoc/presentation4";
import { createEditorView } from "@rippledoc/view-editor";
import type { Section, ScrollTrigger } from "@rippledoc/presentation4";

// ── Presentation ──────────────────────────────────────────────────────────────

const presentation = createPresentation({ basisWidth: 1000, basisHeight: 800 });

// ── Sections ──────────────────────────────────────────────────────────────────
// Each section is exactly one viewport height tall — the "slide" concept.
// Sections stack via offsetFrom so changing any height reflows all downstream sections.

const vh = presentation.root.viewportHeight;

const s1 = presentation.root.addSection();
s1.setVerticalAnchors({ top: constant(0), height: offsetFrom(vh, 0) });

const s2 = presentation.root.addSection();
s2.setVerticalAnchors({
  top: offsetFrom(s1.anchors.bottom, 0),
  height: offsetFrom(vh, 0),
});

const s3 = presentation.root.addSection();
s3.setVerticalAnchors({
  top: offsetFrom(s2.anchors.bottom, 0),
  height: offsetFrom(vh, 0),
});

const s4 = presentation.root.addSection();
s4.setVerticalAnchors({
  top: offsetFrom(s3.anchors.bottom, 0),
  height: offsetFrom(vh, 0),
});

// ── Elements ──────────────────────────────────────────────────────────────────
// topOffset is in basis-space units relative to the section's top edge.
// Changing a section's position automatically carries all its elements with it.

function addText(
  section: Section,
  text: string,
  topOffset: number,
  height: number,
  left = 60,
  width = 880,
) {
  const el = section.addMarkdownElement(text);
  el.setHorizontalAnchors({ left: constant(left), width: constant(width) });
  el.setVerticalAnchors({
    top: offsetFrom(section.anchors.top, topOffset),
    height: constant(height),
  });
  return el;
}

addText(s1, "# Section 1 — Intro\nHeight = one viewport height.", 20, 80);
addText(
  s1,
  "Scroll down to move through the four sections.\nEach trigger zone is shown in the panel on the right.",
  140,
  100,
);
addText(s1, "Another element — midway through Section 1.", 400, 60);

addText(s2, "Section 2 — Chapter 1\nHeight = one viewport height.", 20, 80);
addText(s2, "Trigger B is active while this section is in view.", 140, 60);

addText(s3, "Section 3 — Chapter 2\nHeight = one viewport height.", 20, 80);
addText(s3, "Trigger C is active during Section 4.", 400, 60);

addText(s4, "Section 4 — Outro\nHeight = one viewport height.", 20, 80);
addText(s4, "End of presentation.", 150, 60);

// ── Scroll triggers ───────────────────────────────────────────────────────────
// Trigger positions are derived from section anchors; changing section geometry
// automatically repositions trigger ranges.

const triggerA = presentation.addScrollTrigger({
  name: "A — Intro fade",
  top: fractionOf(vh, 0.3), // starts 30% into s1 (s1.top = 0)
  height: fractionOf(vh, 0.7), // runs to the end of s1
});

const triggerB = presentation.addScrollTrigger({
  name: "B — Chapter 1",
  top: offsetFrom(s2.anchors.top, 0), // exactly covers s2
  height: offsetFrom(s2.anchors.height, 0),
});

const triggerC = presentation.addScrollTrigger({
  name: "C — Outro",
  top: offsetFrom(s4.anchors.top, 0), // starts at the beginning of s4
  height: vh, // covers all of s4
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

// ── Attach view ───────────────────────────────────────────────────────────────

presentation.attachView(createEditorView({ container: "#theContainer" }));
