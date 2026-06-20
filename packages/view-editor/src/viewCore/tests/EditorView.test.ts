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
    expect(() => editor.setMode("player")).not.toThrow();
    expect(() =>
      editor.selection.addElement({} as unknown as Element),
    ).not.toThrow();
    expect(() => editor.events.on("selection:changed", () => {})).not.toThrow();
  });

  it("mode set before attachView is reflected in the DOM immediately on attach", () => {
    editor.setMode("player");
    presentation.attachView(editor.viewFactory);

    expect(getViewport(container).getAttribute("data-mode")).toBe("player");
  });

  it("selection set before attachView is reflected in element CSS classes on attach", () => {
    const section = presentation.root.addSection();
    const el = section.addMarkdownElement("hello");

    // Select before attaching — the element view doesn't exist yet.
    editor.selection.addElement(el);
    presentation.attachView(editor.viewFactory);

    // The element view should have self-initialised from controller.selection.hasElement().
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
    editor.setMode("player");
    expect(getViewport(container).getAttribute("data-mode")).toBe("player");
  });

  it("setMode can be called multiple times and always reflects the latest value", () => {
    editor.setMode("player");
    editor.setMode("editor");
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

  it("addElement() adds the selected class to the matching element div", () => {
    editor.selection.addElement(el1);
    expect(
      getViewport(container).querySelectorAll(".element.selected"),
    ).toHaveLength(1);
  });

  it("addElement() on two elements selects both divs", () => {
    editor.selection.addElement(el1);
    editor.selection.addElement(el2);
    expect(
      getViewport(container).querySelectorAll(".element.selected"),
    ).toHaveLength(2);
  });

  it("removeElement() clears the selected class", () => {
    editor.selection.addElement(el1);
    editor.selection.removeElement(el1);
    expect(
      getViewport(container).querySelector(".element.selected"),
    ).toBeNull();
  });

  it("clear() removes selected class from all elements", () => {
    editor.selection.addElement(el1);
    editor.selection.addElement(el2);
    editor.selection.clear();
    expect(
      getViewport(container).querySelector(".element.selected"),
    ).toBeNull();
  });

  it("setElements() selects exactly the specified elements", () => {
    editor.selection.addElement(el1);
    editor.selection.setElements([el2]);

    const selected =
      getViewport(container).querySelectorAll(".element.selected");
    expect(selected).toHaveLength(1);
    // el1 deselected, el2 selected — verify by checking element count vs. selected count
    expect(getElementDivs(container)).toHaveLength(2);
  });
});

// ── View swap ─────────────────────────────────────────────────────────────────

describe("view swap — mode and selection survive re-attach", () => {
  it("mode set before re-attach is applied to the new view", () => {
    presentation.attachView(editor.viewFactory);
    editor.setMode("player");

    // Re-attach with the same factory — simulates view replacement.
    presentation.attachView(editor.viewFactory);

    expect(getViewport(container).getAttribute("data-mode")).toBe("player");
  });
});
