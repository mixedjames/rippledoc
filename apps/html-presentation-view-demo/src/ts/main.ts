import "../css/styles.css";

import { presentationFromXML, Presentation } from "@rippledoc/presentation";
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
    currentPresentation.layoutView();
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
    '    <element l="40" w="200" t="sectionTop+40" h="120" />',
    '    <element l="280" w="240" t="sectionTop+80" h="160" />',
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
    const viewFactory = new HTMLViewFactory({ root: rootHost });

    const presentation = await presentationFromXML({
      text: source,
      viewFactory,
    });

    // Set viewport dimensions based on the visible container.
    const rect = viewport.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    presentation.setViewportDimensions(width, height);

    presentation.realiseView();
    setPresentation(presentation);

    if (status) {
      status.textContent = "Rendered successfully.";
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
