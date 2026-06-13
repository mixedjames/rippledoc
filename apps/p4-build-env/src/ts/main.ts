import {
  createPresentation,
  constant,
  offsetFrom,
} from "@rippledoc/presentation4";
import { createEditorView } from "@rippledoc/view-editor";

const presentation = createPresentation({ basisWidth: 1000, basisHeight: 800 });

// ── Event demo ────────────────────────────────────────────────────────────────

presentation.events.on("section:added", ({ section, index }) => {
  console.log(`[events] section:added  index=${index}`, section);
});

presentation.events.on("section:removed", ({ section, index }) => {
  console.log(`[events] section:removed  index=${index}`, section);
});

presentation.events.on("element:added", ({ element, section, index }) => {
  console.log(`[events] element:added  index=${index}  section=`, section, "element=", element);
});

presentation.events.on("element:removed", ({ element, section, index }) => {
  console.log(`[events] element:removed  index=${index}  section=`, section, "element=", element);
});

presentation.events.on("anchors:changed", ({ target }) => {
  console.log(`[events] anchors:changed  target=`, target);
});

presentation.events.on("element:markdownChanged", ({ element, markdown }) => {
  console.log(`[events] element:markdownChanged  markdown=${JSON.stringify(markdown)}  element=`, element);
});

presentation.events.on("layout:added", ({ layout }) => {
  console.log(`[events] layout:added  ${layout.basisWidth}×${layout.basisHeight}`);
});

presentation.events.on("layout:activeChanged", ({ layout }) => {
  console.log(`[events] layout:activeChanged  ${layout.basisWidth}×${layout.basisHeight}`);
});

// ── Session mode demo ─────────────────────────────────────────────────────────
// Events are buffered during a session and replayed together on endSession().

console.log("[session] beginSession — mutations below are buffered");
presentation.events.beginSession();

const section1 = presentation.root.addSection();
section1.setVerticalAnchors({ top: constant(0), height: constant(600) });

const section2 = presentation.root.addSection();
section2.setVerticalAnchors({ top: constant(600), height: constant(400) });

const el = section1.addMarkdownElement("# Hello from presentation4");
el.setHorizontalAnchors({ left: constant(50), width: constant(600) });
el.setVerticalAnchors({
  top: offsetFrom(section1.anchors.top, 40),
  height: constant(80),
});

// Element's top depends on section1.anchors.top — changing section1's top
// will propagate an anchors:changed event to el too.
console.log("[session] endSession — replaying buffered events now");
presentation.events.endSession();

// ── Post-session live events ───────────────────────────────────────────────────

console.log("[live] setMarkdown — should fire element:markdownChanged immediately");
el.setMarkdown("# Updated content");

console.log("[live] addLayout — should fire layout:added");
const wideLayout = presentation.layout.addLayout({ basisWidth: 1920, basisHeight: 1080 });

console.log("[live] setActiveLayout — should fire layout:activeChanged");
presentation.layout.setActiveLayout(wideLayout);

// ── Attach view ───────────────────────────────────────────────────────────────

presentation.attachView(createEditorView({ container: "#theContainer" }));
