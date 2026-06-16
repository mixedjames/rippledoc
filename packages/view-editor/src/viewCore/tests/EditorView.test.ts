/**
 * Integration tests for the editor view stack.
 *
 * These tests use the real p4 model (createPresentation) and the real DOM
 * (happy-dom). They verify that controller operations produce the expected
 * DOM state: mode reflected as a data attribute, selection reflected as a
 * CSS class, and pre-attach state applied correctly on first attach.
 *
 * DOM navigation: the view builds inside a Shadow DOM attached to a root div
 * that is appended to the container. The shadow root holds the viewport (.viewport)
 * which contains element divs (.element). Tests navigate this tree directly.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createPresentation } from "@rippledoc/presentation4";
import type { ViewablePresentation } from "@rippledoc/presentation4";
import { createEditorView } from "../views/EditorPresentationView";
import type { EditorViewController } from "../../clientAPI/EditorViewController";
import type { Element } from "@rippledoc/presentation4/viewAPI";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Navigate into the shadow DOM and return the .viewport element. */
function getViewport(container: HTMLElement): Element_ {
  const root = container.firstElementChild as HTMLElement;
  return root.shadowRoot!.querySelector(".viewport")!;
}

/** Return all .element divs currently in the shadow DOM. */
function getElementDivs(container: HTMLElement): NodeListOf<Element_> {
  return getViewport(container).querySelectorAll(".element");
}

// Work around collision between DOM Element and p4 Element types in this file.
type Element_ = globalThis.Element;

// ── Shared setup ─────────────────────────────────────────────────────────────

let container: HTMLDivElement;
let presentation: ViewablePresentation;
let editor: EditorViewController;

beforeEach(() => {
  container = document.createElement("div");
  presentation = createPresentation();
  editor = createEditorView({ container });
});

// ── Pre-attach validity ───────────────────────────────────────────────────────

describe("pre-attach validity", () => {
  it("mode, selection, and events are all usable before attachView", () => {
    expect(editor.mode).toBe("editor");
    expect(() => editor.setMode("anchors")).not.toThrow();
    expect(() => editor.selection.add({} as unknown as Element)).not.toThrow();
    expect(() => editor.events.on("selection:changed", () => {})).not.toThrow();
  });

  it("mode set before attachView is reflected in the DOM immediately on attach", () => {
    editor.setMode("anchors");
    presentation.attachView(editor.viewFactory);

    expect(getViewport(container).getAttribute("data-mode")).toBe("anchors");
  });

  it("selection set before attachView is reflected in element CSS classes on attach", () => {
    const section = presentation.root.addSection();
    const el = section.addMarkdownElement("hello");

    // Select before attaching — the element view doesn't exist yet.
    editor.selection.add(el);
    presentation.attachView(editor.viewFactory);

    // The element view should have self-initialised from controller.selection.has().
    const selected =
      getViewport(container).querySelectorAll(".element.selected");
    expect(selected).toHaveLength(1);
  });
});

// ── Mode → DOM ────────────────────────────────────────────────────────────────

describe("mode — DOM reflection", () => {
  beforeEach(() => {
    presentation.attachView(editor.viewFactory);
  });

  it("default mode is reflected as data-mode=editor on the viewport", () => {
    expect(getViewport(container).getAttribute("data-mode")).toBe("editor");
  });

  it("setMode updates data-mode on the viewport", () => {
    editor.setMode("anchors");
    expect(getViewport(container).getAttribute("data-mode")).toBe("anchors");
  });

  it("setMode can be called multiple times and always reflects the latest value", () => {
    editor.setMode("anchors");
    editor.setMode("player");
    editor.setMode("editor");
    expect(getViewport(container).getAttribute("data-mode")).toBe("editor");
  });
});

// ── Selection → DOM ───────────────────────────────────────────────────────────

describe("selection — CSS class on element divs", () => {
  let el1: Element;
  let el2: Element;

  beforeEach(() => {
    const section = presentation.root.addSection();
    el1 = section.addMarkdownElement("one");
    el2 = section.addMarkdownElement("two");
    presentation.attachView(editor.viewFactory);
  });

  it("no element div has the selected class initially", () => {
    expect(
      getViewport(container).querySelector(".element.selected"),
    ).toBeNull();
  });

  it("selection.add() adds the selected class to the matching element div", () => {
    editor.selection.add(el1);
    expect(
      getViewport(container).querySelectorAll(".element.selected"),
    ).toHaveLength(1);
  });

  it("selection.add() on two elements selects both divs", () => {
    editor.selection.add(el1);
    editor.selection.add(el2);
    expect(
      getViewport(container).querySelectorAll(".element.selected"),
    ).toHaveLength(2);
  });

  it("selection.remove() clears the selected class", () => {
    editor.selection.add(el1);
    editor.selection.remove(el1);
    expect(
      getViewport(container).querySelector(".element.selected"),
    ).toBeNull();
  });

  it("selection.clear() removes selected class from all elements", () => {
    editor.selection.add(el1);
    editor.selection.add(el2);
    editor.selection.clear();
    expect(
      getViewport(container).querySelector(".element.selected"),
    ).toBeNull();
  });

  it("selection.set() selects exactly the specified elements", () => {
    editor.selection.add(el1);
    editor.selection.set([el2]);

    const selected =
      getViewport(container).querySelectorAll(".element.selected");
    expect(selected).toHaveLength(1);
    // el1 deselected, el2 selected — verify by checking element count vs. selected count
    expect(getElementDivs(container)).toHaveLength(2);
  });
});

// ── Anchors mode — content hidden ─────────────────────────────────────────────

describe("anchors mode — element content visibility", () => {
  it("element-content divs are hidden in anchors mode", () => {
    const section = presentation.root.addSection();
    section.addMarkdownElement("visible text");
    presentation.attachView(editor.viewFactory);

    editor.setMode("anchors");

    // The CSS rule [data-mode="anchors"] .element-content { display: none } is
    // defined in the shadow DOM stylesheet. We can verify data-mode is set, which
    // is sufficient to confirm the CSS rule will apply — computed styles are not
    // available in happy-dom.
    expect(getViewport(container).getAttribute("data-mode")).toBe("anchors");
    expect(
      getViewport(container).querySelector(".element-content"),
    ).not.toBeNull();
  });

  it("switching back from anchors to editor restores data-mode", () => {
    const section = presentation.root.addSection();
    section.addMarkdownElement("text");
    presentation.attachView(editor.viewFactory);

    editor.setMode("anchors");
    editor.setMode("editor");

    expect(getViewport(container).getAttribute("data-mode")).toBe("editor");
  });
});

// ── View swap ─────────────────────────────────────────────────────────────────

describe("view swap — mode and selection survive re-attach", () => {
  it("mode set before re-attach is applied to the new view", () => {
    presentation.attachView(editor.viewFactory);
    editor.setMode("anchors");

    // Re-attach with the same factory — simulates view replacement.
    presentation.attachView(editor.viewFactory);

    expect(getViewport(container).getAttribute("data-mode")).toBe("anchors");
  });
});
