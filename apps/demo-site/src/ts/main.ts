import "../css/styles.css";

import {
  HTMLPresentationView,
  Presentation,
  loadFromXML,
} from "@rippledoc/presentation2";

let presentation: Presentation | null = null;

try {
  const p = await loadFromXML({ url: "presentations/demo1.xml" });
  presentation = p;

  const htmlView = new HTMLPresentationView({
    presentation: p,
    container: "#theContainer",
  });
} catch (e) {
  console.error("Compilation error:", e);
}

const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const menuCloseButton = document.getElementById("menuCloseButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const presentationContainer = document.getElementById("theContainer");

const deviceViewportPhysical = document.getElementById(
  "deviceViewportPhysical",
);
const deviceViewportLogical = document.getElementById("deviceViewportLogical");
const deviceResolution = document.getElementById("deviceResolution");
const presentationBasisSize = document.getElementById("presentationBasisSize");
const presentationScale = document.getElementById("presentationScale");
const presentationViewportSize = document.getElementById(
  "presentationViewportSize",
);

const updateDiagnostics = () => {
  if (
    !deviceViewportPhysical ||
    !deviceViewportLogical ||
    !deviceResolution ||
    !presentationBasisSize ||
    !presentationScale ||
    !presentationViewportSize
  ) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  deviceViewportPhysical.textContent = `${Math.round(viewportWidth)} × ${Math.round(viewportHeight)}`;

  const logicalWidth = viewportWidth * dpr;
  const logicalHeight = viewportHeight * dpr;
  deviceViewportLogical.textContent = `${Math.round(logicalWidth)} × ${Math.round(logicalHeight)}  (@dpr ${dpr.toFixed(2)})`;

  deviceResolution.textContent = `${screen.width} × ${screen.height}`;

  if (!presentation) {
    presentationBasisSize.textContent = "—";
    presentationScale.textContent = "—";
    presentationViewportSize.textContent = "—";
    return;
  }

  const basis = presentation.basisDimensions;
  presentationBasisSize.textContent = `${basis.width} × ${basis.height}`;

  let physicalDimensions;
  try {
    physicalDimensions = presentation.physicalDimensions;
  } catch {
    physicalDimensions = null;
  }

  if (!physicalDimensions) {
    presentationScale.textContent = "—";
    presentationViewportSize.textContent = "—";
    return;
  }

  const scale = physicalDimensions.scale;
  presentationScale.textContent = scale.toFixed(3);

  const viewportPhysicalWidth = basis.width * scale;
  const viewportPhysicalHeight = basis.height * scale;
  presentationViewportSize.textContent = `${Math.round(viewportPhysicalWidth)} × ${Math.round(viewportPhysicalHeight)}`;
};

if (fullscreenButton && presentationContainer) {
  if (!document.fullscreenEnabled) {
    (fullscreenButton as HTMLButtonElement).style.display = "none";
  } else {
    const updateFullscreenButtonState = () => {
      const isFullscreen = document.fullscreenElement === presentationContainer;
      fullscreenButton.setAttribute(
        "aria-pressed",
        isFullscreen ? "true" : "false",
      );
      fullscreenButton.setAttribute(
        "aria-label",
        isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
      );
    };

    fullscreenButton.addEventListener("click", () => {
      if (document.fullscreenElement === presentationContainer) {
        document.exitFullscreen().catch(() => {
          // ignore errors
        });
      } else {
        (presentationContainer as HTMLElement).requestFullscreen().catch(() => {
          // ignore errors
        });
      }
    });

    document.addEventListener("fullscreenchange", () => {
      updateFullscreenButtonState();
    });

    updateFullscreenButtonState();
  }
}

if (menuButton && menuOverlay && menuCloseButton) {
  const body = document.body;

  const openMenu = () => {
    menuOverlay.classList.add("is-open");
    menuOverlay.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    body.style.overflow = "hidden";

    updateDiagnostics();
  };

  const closeMenu = () => {
    menuOverlay.classList.remove("is-open");
    menuOverlay.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    body.style.overflow = "";
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuOverlay.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuCloseButton.addEventListener("click", () => {
    closeMenu();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOverlay.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (menuOverlay.classList.contains("is-open")) {
      updateDiagnostics();
    }
  });
}
