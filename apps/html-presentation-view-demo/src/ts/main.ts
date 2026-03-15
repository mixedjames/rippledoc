import "../css/styles.css";

import { Presentation } from "@rippledoc/presentation";
import { presentationFromXML } from "@rippledoc/presentationBuilder";
import { HTMLViewFactory } from "@rippledoc/htmlPresentationView";

type ViewMode = "edit" | "view";

type SampleDefinition = {
  id: string;
  name: string;
};

type PresentationStyle = {
  id: string;
  name: string;
  className: string;
};

const PRESENTATION_STYLES: PresentationStyle[] = [
  { id: "default", name: "Default", className: "style-default" },
  {
    id: "nejm",
    name: "New England Journal of Medicine",
    className: "style-nejm",
  },
];

const SAMPLE_DEFINITIONS: SampleDefinition[] = [
  { id: "default", name: "Default example" },
  { id: "scroll-trigger", name: "Scroll trigger example" },
];

window.addEventListener("DOMContentLoaded", () => {
  const xmlInput = document.getElementById(
    "xml-input",
  ) as HTMLTextAreaElement | null;
  const renderBtn = document.getElementById(
    "render-btn",
  ) as HTMLButtonElement | null;
  const sampleSelect = document.getElementById(
    "sample-select",
  ) as HTMLSelectElement | null;
  const styleSelect = document.getElementById(
    "style-select",
  ) as HTMLSelectElement | null;
  const status = document.getElementById("status") as HTMLSpanElement | null;
  const errorOutput = document.getElementById(
    "error-output",
  ) as HTMLDivElement | null;

  const backToEditBtn = document.getElementById(
    "back-to-edit-btn",
  ) as HTMLButtonElement | null;
  const viewStatus = document.getElementById(
    "view-status",
  ) as HTMLSpanElement | null;
  const viewErrorOutput = document.getElementById(
    "view-error-output",
  ) as HTMLDivElement | null;
  const fullpageViewport = document.getElementById(
    "fullpage-viewport",
  ) as HTMLDivElement | null;
  const fullscreenBtn = document.getElementById(
    "fullscreen-btn",
  ) as HTMLButtonElement | null;

  if (
    !xmlInput ||
    !renderBtn ||
    !backToEditBtn ||
    !viewErrorOutput ||
    !fullpageViewport
  ) {
    return;
  }

  if (!xmlInput.value) {
    void loadSampleIntoEditor("default", xmlInput, status);
  }

  let mode: ViewMode = "edit";
  let currentViewPresentation: Presentation | null = null;
  let currentStyleId: string = styleSelect?.value || "default";

  const setMode = (nextMode: ViewMode) => {
    if (mode === nextMode) {
      return;
    }

    mode = nextMode;
    const body = document.body;
    body.classList.remove("app--edit", "app--view");
    body.classList.add(nextMode === "edit" ? "app--edit" : "app--view");

    const viewPage = document.getElementById("view-page");
    if (viewPage) {
      viewPage.setAttribute(
        "aria-hidden",
        nextMode === "view" ? "false" : "true",
      );
    }
  };

  const populateSampleOptions = () => {
    if (!sampleSelect) return;

    sampleSelect.innerHTML = "";
    for (const sample of SAMPLE_DEFINITIONS) {
      const option = document.createElement("option");
      option.value = sample.id;
      option.textContent = sample.name;
      sampleSelect.appendChild(option);
    }
    sampleSelect.value = "default";
  };

  const relayout = (viewportEl: HTMLDivElement, presentation: Presentation) => {
    const rect = viewportEl.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    presentation.setViewportDimensions(width, height);
    const display = presentation.display;
    display.layout();
    display.setTriggerMarkerVisibility(true);
  };

  const applyPresentationStyle = (styleId: string) => {
    if (!fullpageViewport) return;

    const found = PRESENTATION_STYLES.find((s) => s.id === styleId);
    const style = (found ?? PRESENTATION_STYLES[0]) as PresentationStyle;
    fullpageViewport.className =
      "fullpage-viewport" + (style.className ? " " + style.className : "");
  };

  const populateStyleOptions = () => {
    if (!styleSelect) return;

    styleSelect.innerHTML = "";
    for (const style of PRESENTATION_STYLES) {
      const option = document.createElement("option");
      option.value = style.id;
      option.textContent = style.name;
      styleSelect.appendChild(option);
    }
    styleSelect.value = currentStyleId;
  };

  const renderToFullView = () => {
    void handleRenderClick({
      xmlInput,
      status: status ?? viewStatus,
      errorOutput: errorOutput ?? viewErrorOutput,
      viewport: fullpageViewport,
      setPresentation(p: Presentation) {
        currentViewPresentation = p;
        setMode("view");
        relayout(fullpageViewport, p);
      },
    });
  };

  if (sampleSelect) {
    populateSampleOptions();
    sampleSelect.addEventListener("change", () => {
      const id = sampleSelect.value || "default";
      void loadSampleIntoEditor(id, xmlInput, status, sampleSelect);
    });
  }

  if (styleSelect) {
    populateStyleOptions();
    styleSelect.addEventListener("change", () => {
      currentStyleId = styleSelect.value || "default";
      applyPresentationStyle(currentStyleId);
    });
  }

  applyPresentationStyle(currentStyleId);

  renderBtn.addEventListener("click", () => {
    renderToFullView();
  });

  backToEditBtn.addEventListener("click", () => {
    setMode("edit");
  });

  if (fullscreenBtn && fullpageViewport && fullpageViewport.requestFullscreen) {
    const updateFullscreenLabel = () => {
      if (document.fullscreenElement) {
        fullscreenBtn.textContent = "Exit fullscreen";
      } else {
        fullscreenBtn.textContent = "Enter fullscreen";
      }
    };

    fullscreenBtn.addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) {
          await fullpageViewport.requestFullscreen();
        } else if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.error(err);
      } finally {
        updateFullscreenLabel();
      }
    });

    document.addEventListener("fullscreenchange", updateFullscreenLabel);
    updateFullscreenLabel();
  } else if (fullscreenBtn) {
    fullscreenBtn.disabled = true;
    fullscreenBtn.title = "Fullscreen not supported in this browser.";
  }

  window.addEventListener("resize", () => {
    if (mode === "view" && currentViewPresentation && fullpageViewport) {
      relayout(fullpageViewport, currentViewPresentation);
    }
  });
});

async function loadSampleIntoEditor(
  id: string,
  xmlInput: HTMLTextAreaElement,
  status: HTMLSpanElement | null,
  sampleSelect?: HTMLSelectElement | null,
): Promise<void> {
  const url = getSampleUrl(id);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to load sample: ${response.status} ${response.statusText}`,
      );
    }

    const text = await response.text();
    xmlInput.value = text.trim();

    if (status) {
      if (sampleSelect) {
        const selectedOption = sampleSelect.options[sampleSelect.selectedIndex];
        if (selectedOption) {
          status.textContent = "Loaded sample: " + selectedOption.text;
        }
      } else {
        status.textContent = "Loaded default sample.";
      }
    }
  } catch (err) {
    console.error(err);
    if (status) {
      status.textContent = "Failed to load sample XML.";
    }
  }
}

function getSampleUrl(id: string): string {
  switch (id) {
    case "scroll-trigger":
      return "presentations/basic-scrolltrigger.xml";
    case "default":
    default:
      return "presentations/default.xml";
  }
}

async function handleRenderClick(options: {
  xmlInput: HTMLTextAreaElement;
  status: HTMLSpanElement | null;
  errorOutput: HTMLDivElement;
  viewport: HTMLDivElement;
  setPresentation: (presentation: Presentation) => void;
}): Promise<void> {
  const { xmlInput, status, errorOutput, viewport, setPresentation } = options;

  const source = xmlInput.value.trim();
  errorOutput.textContent = "";
  viewport.innerHTML = "";

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
      // Use #viewport as the host; all internal structure is code-created.
      root: viewport,
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

    // Realise the presentation to create all views and scroll triggers.
    presentation.display.realise();
    setPresentation(presentation);

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
