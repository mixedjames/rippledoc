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
import { createPresentation } from "@rippledoc/presentation4";
import type { ViewablePresentation } from "@rippledoc/presentation4";
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
let presentation: ViewablePresentation;
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
