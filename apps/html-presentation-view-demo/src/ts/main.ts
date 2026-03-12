import "../css/styles.css";

import { Presentation } from "@rippledoc/presentation";
import { presentationFromXML } from "@rippledoc/presentationBuilder";
import { HTMLViewFactory } from "@rippledoc/htmlPresentationView";

window.addEventListener("DOMContentLoaded", () => {
  const xmlInput = document.getElementById(
    "xml-input",
  ) as HTMLTextAreaElement | null;
  const renderBtn = document.getElementById(
    "render-btn",
  ) as HTMLButtonElement | null;
  const status = document.getElementById("status") as HTMLSpanElement | null;
  const errorOutput = document.getElementById(
    "error-output",
  ) as HTMLDivElement | null;
  const viewport = document.getElementById("viewport") as HTMLDivElement | null;
  const rootHost = document.getElementById(
    "presentation-root",
  ) as HTMLDivElement | null;

  if (!xmlInput || !renderBtn || !errorOutput || !viewport || !rootHost) {
    return;
  }

  if (!xmlInput.value) {
    xmlInput.value = getDefaultXmlExample();
  }
  let currentPresentation: Presentation | null = null;

  const relayout = () => {
    if (!currentPresentation) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    currentPresentation.setViewportDimensions(width, height);
    const display = currentPresentation.display;
    display.layout();
    display.setTriggerMarkerVisibility(true);
  };

  renderBtn.addEventListener("click", () => {
    void handleRenderClick({
      xmlInput,
      status,
      errorOutput,
      viewport,
      rootHost,
      setPresentation(p: Presentation) {
        currentPresentation = p;
        relayout();
      },
    });
  });

  window.addEventListener("resize", () => {
    relayout();
  });
});

function getDefaultXmlExample(): string {
  return [
    "<document>",
    '  <slideSize w="800" h="600" />',
    '  <section h="slideHeight">',
    '    <image source="img/drawing.png" l="40" w="200" t="sectionTop+40" h="120" />',
    '    <element l="280" w="240" t="sectionTop+80" h="160" />',
    "  </section>",
    '  <section h="slideHeight">',
    '    <textbox l="60" w="320" t="sectionTop+60" h="180">',
    "      <scroll-trigger",
    '        name="t1"',
    '        start="sectionTop" start-hits="middle"',
    '        end="sectionBottom" end-hits="middle"',
    "        />",
    '      <pin trigger="t1"/>',
    "      This section has a pinned textbox. Scroll triggers are defined as child nodes of the element they reference, and pins are defined as child nodes of the element they apply to.",
    "    </textbox>",
    "  </section>",
    '  <section h="slideHeight">',
    '    <element l="60" w="320" t="sectionTop+60" h="180" />',
    "  </section>",
    "</document>",
  ].join("\n");
}

async function handleRenderClick(options: {
  xmlInput: HTMLTextAreaElement;
  status: HTMLSpanElement | null;
  errorOutput: HTMLDivElement;
  viewport: HTMLDivElement;
  rootHost: HTMLDivElement;
  setPresentation: (presentation: Presentation) => void;
}): Promise<void> {
  const { xmlInput, status, errorOutput, viewport, rootHost, setPresentation } =
    options;

  const source = xmlInput.value.trim();
  errorOutput.textContent = "";
  rootHost.innerHTML = "";

  if (status) {
    status.textContent = source
      ? "Rendering presentation…"
      : "Please enter some XML.";
  }

  if (!source) {
    return;
  }

  try {
    const viewFactory = new HTMLViewFactory({
      root: rootHost,
      scrollingElement: viewport,
    });

    const presentation = await presentationFromXML({
      text: source,
      viewFactory,
    });

    console.log("[html-presentation-view-demo] Presentation built", {
      sections: presentation.sections.length,
      scrollTriggerCount: presentation.scrollTriggers.length,
    });

    // Set viewport dimensions based on the visible container.
    const rect = viewport.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    presentation.setViewportDimensions(width, height);

    console.log("[html-presentation-view-demo] Initial viewport", {
      width,
      height,
    });

    presentation.display.realise();
    setPresentation(presentation);

    presentation.scrollTriggers.forEach((trigger) => {
      trigger.on("start", (e) => console.log("start"));
      trigger.on("end", (e) => console.log("end"));
      trigger.on("reverseStart", (e) => console.log("reverseStart"));
      trigger.on("reverseEnd", (e) => console.log("reverseEnd"));
    });

    if (status) {
      const triggerCount = presentation.scrollTriggers.length;
      status.textContent =
        triggerCount > 0
          ? `Rendered successfully. Scroll triggers: ${triggerCount}.`
          : "Rendered successfully. No scroll triggers found.";
    }
  } catch (err) {
    console.error(err);
    const message = (err as Error).message ?? "Unexpected error";
    errorOutput.textContent = message;
    if (status) {
      status.textContent = "Failed to render presentation.";
    }
  }
}
