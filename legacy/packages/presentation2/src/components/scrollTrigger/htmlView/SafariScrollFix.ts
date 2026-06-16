/**
 * Applies fixes for Safari/iOS scrolling behavior.
 * Early returns if not running on Safari or iOS.
 *
 * Specific issue address:
 *  - When Safari tab/page loses the focus, elements that are scrolling with momentum can seem
 *    to pause.
 *  - When the tab/page regains focus, the scroll position can jump to the top of the page.
 */
export function safariScrollFix(scrollingElement: HTMLElement): void {
  // Detect Safari (including iOS Safari)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);

  // Only apply fix on Safari or iOS
  if (!isSafari && !isIOS) {
    return;
  }

  let needsScrollReset = false;

  window.addEventListener("blur", () => {
    needsScrollReset = true;
  });

  window.addEventListener("focus", () => {
    if (!needsScrollReset) return;

    console.log("Resetting scroll to prevent jump due to pinning.");

    needsScrollReset = false;

    const y = scrollingElement.scrollTop;

    scrollingElement.style.overflowY = "hidden";
    scrollingElement.scrollTop = y;

    requestAnimationFrame(() => {
      scrollingElement.style.overflowY = "scroll";
    });
  });
}
