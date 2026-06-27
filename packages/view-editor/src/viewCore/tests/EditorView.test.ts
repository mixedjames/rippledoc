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
import type { Presentation } from "@rippledoc/presentation4";
import { createEditorView } from "../views/EditorPresentationView";
import type { EditorViewController } from "../../clientAPI/EditorViewController";
import type { Element, Section } from "@rippledoc/presentation4/viewAPI";

// ── Helpers ──────────────────────────────────────────────────────────────────

// Work around collision between DOM Element and p4 Element/Section types.
type Element_ = globalThis.Element;

/** Navigate into the shadow DOM and return the .viewport element. */
function getViewport(container: HTMLElement): Element_ {
  const root = container.firstElementChild as HTMLElement;
  return root.shadowRoot!.querySelector(".viewport")!;
}

/** Return all .element divs currently in the shadow DOM. */
function getElementDivs(container: HTMLElement): NodeListOf<Element_> {
  return getViewport(container).querySelectorAll(".element");
}

/** Return all .section-background divs in the backgrounds layer. */
function getSectionBackgrounds(container: HTMLElement): NodeListOf<Element_> {
  return getViewport(container)
    .querySelector(".backgrounds")!
    .querySelectorAll(".section-background");
}

/** Return all selected section backgrounds. */
function getSelectedSectionBackgrounds(
  container: HTMLElement,
): NodeListOf<Element_> {
  return getViewport(container)
    .querySelector(".backgrounds")!
    .querySelectorAll(".section-background.selected");
}

// ── Shared setup ─────────────────────────────────────────────────────────────

let container: HTMLDivElement;
let presentation: Presentation;
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

  it("focus set before attachView is reflected in element CSS classes on attach", () => {
    const section = presentation.root.addSection();
    const el = section.addMarkdownElement("hello");

    editor.selection.setFocusedElement(el);
    presentation.attachView(editor.viewFactory);

    const focused = getViewport(container).querySelectorAll(".element.focused");
    expect(focused).toHaveLength(1);
  });

  it("section selection set before attachView is reflected in background div class on attach", () => {
    const section = presentation.root.addSection() as unknown as Section;
    editor.selection.addSection(section);
    presentation.attachView(editor.viewFactory);

    expect(getSelectedSectionBackgrounds(container)).toHaveLength(1);
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

// ── Focus → DOM ───────────────────────────────────────────────────────────────

describe("focus — CSS class on element divs", () => {
  let el1: Element;
  let el2: Element;

  beforeEach(() => {
    const section = presentation.root.addSection();
    el1 = section.addMarkdownElement("one");
    el2 = section.addMarkdownElement("two");
    presentation.attachView(editor.viewFactory);
  });

  it("no element div has the focused class initially", () => {
    expect(getViewport(container).querySelector(".element.focused")).toBeNull();
  });

  it("setFocusedElement adds the focused class to the matching element div only", () => {
    editor.selection.setFocusedElement(el1);
    expect(
      getViewport(container).querySelectorAll(".element.focused"),
    ).toHaveLength(1);
  });

  it("setFocusedElement on a second element moves the focused class", () => {
    editor.selection.setFocusedElement(el1);
    editor.selection.setFocusedElement(el2);
    const focused = getViewport(container).querySelectorAll(".element.focused");
    expect(focused).toHaveLength(1);
  });

  it("clearFocusedElement removes the focused class", () => {
    editor.selection.setFocusedElement(el1);
    editor.selection.clearFocusedElement();
    expect(getViewport(container).querySelector(".element.focused")).toBeNull();
  });

  it("focused class is independent of selected class", () => {
    editor.selection.addElement(el1);
    editor.selection.setFocusedElement(el2);
    expect(
      getViewport(container).querySelectorAll(".element.selected"),
    ).toHaveLength(1);
    expect(
      getViewport(container).querySelectorAll(".element.focused"),
    ).toHaveLength(1);
  });
});

// ── Section selection → DOM ───────────────────────────────────────────────────

describe("section selection — CSS class on section background divs", () => {
  let sec1: Section;
  let sec2: Section;

  beforeEach(() => {
    sec1 = presentation.root.addSection() as unknown as Section;
    sec2 = presentation.root.addSection() as unknown as Section;
    presentation.attachView(editor.viewFactory);
  });

  it("two section background divs are present after attaching two sections", () => {
    expect(getSectionBackgrounds(container)).toHaveLength(2);
  });

  it("no section background has the selected class initially", () => {
    expect(getSelectedSectionBackgrounds(container)).toHaveLength(0);
  });

  it("addSection() adds the selected class to the matching background div", () => {
    editor.selection.addSection(sec1);
    expect(getSelectedSectionBackgrounds(container)).toHaveLength(1);
  });

  it("addSection() on two sections selects both background divs", () => {
    editor.selection.addSection(sec1);
    editor.selection.addSection(sec2);
    expect(getSelectedSectionBackgrounds(container)).toHaveLength(2);
  });

  it("removeSection() clears the selected class", () => {
    editor.selection.addSection(sec1);
    editor.selection.removeSection(sec1);
    expect(getSelectedSectionBackgrounds(container)).toHaveLength(0);
  });

  it("clear() removes selected class from all section backgrounds", () => {
    editor.selection.addSection(sec1);
    editor.selection.addSection(sec2);
    editor.selection.clear();
    expect(getSelectedSectionBackgrounds(container)).toHaveLength(0);
  });

  it("setElements() cross-clears sections — no background div remains selected", () => {
    // setElements fires selection:changed (hadData=true) which clears the section chrome.
    editor.selection.addSection(sec1);
    editor.selection.setElements([]);
    expect(getSelectedSectionBackgrounds(container)).toHaveLength(0);
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

  it("element selection survives re-attach — selected class appears on new view's div", () => {
    const section = presentation.root.addSection();
    const el = section.addMarkdownElement("hello");
    presentation.attachView(editor.viewFactory);
    editor.selection.addElement(el as unknown as Element);

    presentation.attachView(editor.viewFactory);

    expect(
      getViewport(container).querySelectorAll(".element.selected"),
    ).toHaveLength(1);
  });
});
