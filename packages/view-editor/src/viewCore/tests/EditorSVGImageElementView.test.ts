/**
 * Integration tests for EditorSVGImageElementView.
 *
 * Covers the async SVG load path: successful load, failed fetch, and abort
 * on destroy. Tests use a mocked global `fetch` and the real p4 model + DOM
 * stack (same pattern as EditorView.test.ts).
 *
 * DOM navigation: the loaded SVG is inserted into the element's content wrapper
 * inside the shadow root. Tests reach it via the viewport → element → svg path.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createPresentation, constant } from "@rippledoc/presentation4";
import type { Presentation } from "@rippledoc/presentation4";
import { createEditorView } from "../views/EditorPresentationView";
import type { EditorViewController } from "../../clientAPI/EditorViewController";

// ── Helpers ──────────────────────────────────────────────────────────────────

type Element_ = globalThis.Element;

function getViewport(container: HTMLElement): Element_ {
  const root = container.firstElementChild as HTMLElement;
  return root.shadowRoot!.querySelector(".viewport")!;
}

/** Returns the first <svg> element inside any .element div in the shadow DOM. */
function getSVGInElement(container: HTMLElement): Element_ | null {
  return getViewport(container).querySelector(".element svg");
}

/** Flush all pending microtasks and macrotasks so promise chains settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const VALID_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>';

// ── Shared setup ─────────────────────────────────────────────────────────────

let container: HTMLDivElement;
let presentation: Presentation;
let editor: EditorViewController;

beforeEach(() => {
  container = document.createElement("div");
  presentation = createPresentation();
  editor = createEditorView({ container });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ── Success path ──────────────────────────────────────────────────────────────

describe("successful SVG load", () => {
  it("replaces the placeholder with the fetched SVG element", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(VALID_SVG),
      }),
    );

    const section = presentation.root.addSection();
    const el = section.addSVGImageElement();
    el.setSrc("test.svg");
    presentation.attachView(editor.viewFactory);

    await flushPromises();

    expect(getSVGInElement(container)).not.toBeNull();
  });

  it("calls fetch with the element's src", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(VALID_SVG),
    });
    vi.stubGlobal("fetch", mockFetch);

    const section = presentation.root.addSection();
    const el = section.addSVGImageElement();
    el.setSrc("images/diagram.svg");
    presentation.attachView(editor.viewFactory);

    await flushPromises();

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0]![0]).toBe("images/diagram.svg");
  });

  it("passes an AbortSignal to fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(VALID_SVG),
    });
    vi.stubGlobal("fetch", mockFetch);

    const section = presentation.root.addSection();
    const el = section.addSVGImageElement();
    el.setSrc("test.svg");
    presentation.attachView(editor.viewFactory);

    await flushPromises();

    const signal = mockFetch.mock.calls[0]![1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
  });
});

// ── Failure path ──────────────────────────────────────────────────────────────

describe("failed SVG fetch", () => {
  it("logs an error when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const section = presentation.root.addSection();
    const el = section.addSVGImageElement();
    el.setSrc("missing.svg");
    presentation.attachView(editor.viewFactory);

    await flushPromises();

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(String(errorSpy.mock.calls[0]![0])).toContain("404");
  });

  it("leaves a placeholder SVG in the element after a failed fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const section = presentation.root.addSection();
    const el = section.addSVGImageElement();
    el.setSrc("broken.svg");
    presentation.attachView(editor.viewFactory);

    await flushPromises();

    // Placeholder SVG was inserted in the constructor and never replaced.
    expect(getSVGInElement(container)).not.toBeNull();
  });
});

// ── Sub-component animation targeting ────────────────────────────────────────

/**
 * Returns a minimal mock Web Animations API Animation object.
 * WaapiAnimationDriver calls pause() and sets currentTime immediately after
 * animate(), so those must exist.
 */
function makeFakeWaapi() {
  return {
    pause: vi.fn(),
    cancel: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    finish: vi.fn(),
    currentTime: 0 as CSSNumberish | null,
    playbackRate: 1,
    playState: "paused" as AnimationPlayState,
  };
}

const SVG_WITH_PATH =
  '<svg xmlns="http://www.w3.org/2000/svg"><path id="my-path" d="M0,0"/></svg>';

describe("sub-component animation targeting", () => {
  // happy-dom doesn't implement Element.prototype.animate. Install a
  // call-tracking stub so WaapiAnimationDriver can call it, and record which
  // element was the receiver so we can assert the correct target.
  let animateCalls: Element_[];

  beforeEach(() => {
    animateCalls = [];
    Object.defineProperty(Element.prototype, "animate", {
      configurable: true,
      writable: true,
      value: function (this: Element_) {
        animateCalls.push(this);
        return makeFakeWaapi();
      },
    });
  });

  afterEach(() => {
    delete (Element.prototype as unknown as Record<string, unknown>)["animate"];
  });

  it("calls animate() on the SVG sub-element, not the outer div", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(SVG_WITH_PATH),
      }),
    );

    const section = presentation.root.addSection();
    const svgEl = section.addSVGImageElement();
    svgEl.setSrc("diagram.svg");

    const trigger = presentation.addScrollTrigger({
      top: constant(0),
      height: constant(200),
    });
    svgEl.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: [
        { position: 0, opacity: 0 },
        { position: 500, opacity: 1 },
      ],
      duration: 500,
      scrollDriven: true,
      target: svgEl.subComponent("#my-path"),
    });

    // Attach view in player mode so animations are enabled.
    presentation.attachView(editor.viewFactory);
    editor.setMode("player");
    await flushPromises();

    // animate() must have been called exactly once — on the sub-element.
    expect(animateCalls).toHaveLength(1);
    expect(animateCalls[0]?.id).toBe("my-path");
  });

  it("defers driver creation until SVG loads", async () => {
    // Hold the fetch resolution so we can verify the pre-load state.
    let resolveFetch!: () => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise<{ ok: boolean; text: () => Promise<string> }>((resolve) => {
          resolveFetch = () =>
            resolve({ ok: true, text: async () => SVG_WITH_PATH });
        }),
      ),
    );

    const section = presentation.root.addSection();
    const svgEl = section.addSVGImageElement();
    svgEl.setSrc("diagram.svg");

    const trigger = presentation.addScrollTrigger({
      top: constant(0),
      height: constant(200),
    });
    svgEl.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: [
        { position: 0, opacity: 0 },
        { position: 500, opacity: 1 },
      ],
      duration: 500,
      scrollDriven: true,
      target: svgEl.subComponent("#my-path"),
    });

    presentation.attachView(editor.viewFactory);
    editor.setMode("player");
    await flushPromises(); // fetch still pending — no animate() call yet

    expect(animateCalls).toHaveLength(0);

    resolveFetch();
    await flushPromises(); // SVG loads → driver created

    expect(animateCalls).toHaveLength(1);
    expect(animateCalls[0]?.id).toBe("my-path");
  });

  it("rebuilds the driver on animation:targetChanged", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(
            '<svg xmlns="http://www.w3.org/2000/svg"><path id="path-a" d="M0,0"/><path id="path-b" d="M1,1"/></svg>',
          ),
      }),
    );

    const section = presentation.root.addSection();
    const svgEl = section.addSVGImageElement();
    svgEl.setSrc("diagram.svg");

    const trigger = presentation.addScrollTrigger({
      top: constant(0),
      height: constant(200),
    });
    const anim = svgEl.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: [
        { position: 0, opacity: 0 },
        { position: 500, opacity: 1 },
      ],
      duration: 500,
      scrollDriven: true,
      target: svgEl.subComponent("#path-a"),
    });

    presentation.attachView(editor.viewFactory);
    editor.setMode("player");
    await flushPromises();

    // First driver targets #path-a.
    expect(animateCalls).toHaveLength(1);
    expect(animateCalls[0]?.id).toBe("path-a");

    animateCalls.length = 0;

    // Reassign the target — should tear down the old driver and create a new one.
    anim.setTarget(svgEl.subComponent("#path-b"));

    expect(animateCalls).toHaveLength(1);
    expect(animateCalls[0]?.id).toBe("path-b");
  });
});

// ── Abort on destroy ──────────────────────────────────────────────────────────

describe("abort on destroy", () => {
  it("does not log an error when the fetch is aborted by destroy()", async () => {
    // Fetch that rejects with AbortError when its signal fires.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        (_url: string, options?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            options?.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      ),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const section = presentation.root.addSection();
    const el = section.addSVGImageElement();
    el.setSrc("slow.svg");
    presentation.attachView(editor.viewFactory);

    // Destroy the element view while the fetch is still pending.
    section.removeElement(el);

    await flushPromises();

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
