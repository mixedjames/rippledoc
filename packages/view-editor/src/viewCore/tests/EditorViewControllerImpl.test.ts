/**
 * Unit tests for EditorViewControllerImpl.
 *
 * These tests cover the controller in isolation — no DOM, no p4 model.
 * The controller owns mode and selection state independently of the view,
 * so the full surface is testable here without any rendering infrastructure.
 */

import { describe, it, expect, vi } from "vitest";
import { EditorViewControllerImpl } from "../EditorViewControllerImpl";
import type { Element, Section } from "@rippledoc/presentation4/viewAPI";

// A minimal stand-in for AttachedView — satisfies the structural interface.
const makeViewSpy = () => ({ applyMode: vi.fn() });

// Identity is all that matters for selection; any object works as a stand-in.
const makeEl = () => ({}) as unknown as Element;
const makeSec = () => ({}) as unknown as Section;

// ── Mode ─────────────────────────────────────────────────────────────────────

describe("mode — initial state and basic updates", () => {
  it("starts in editor mode", () => {
    const ctrl = new EditorViewControllerImpl();
    expect(ctrl.mode).toBe("editor");
  });

  it("setMode updates the mode getter", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.setMode("player");
    expect(ctrl.mode).toBe("player");
  });

  it("setMode with no view attached is safe", () => {
    const ctrl = new EditorViewControllerImpl();
    expect(() => ctrl.setMode("player")).not.toThrow();
  });

  it("setMode after unregisterView is safe", () => {
    const ctrl = new EditorViewControllerImpl();
    const spy = makeViewSpy();
    ctrl.registerView(spy);
    ctrl.unregisterView();
    expect(() => ctrl.setMode("player")).not.toThrow();
    // applyMode was only called once: from registerView, not from the post-unregister setMode
    expect(spy.applyMode).toHaveBeenCalledOnce();
  });
});

describe("mode — view interaction", () => {
  it("setMode with an attached view calls applyMode immediately", () => {
    const ctrl = new EditorViewControllerImpl();
    const spy = makeViewSpy();
    ctrl.registerView(spy);
    spy.applyMode.mockClear();

    ctrl.setMode("player");

    expect(spy.applyMode).toHaveBeenCalledOnce();
    expect(spy.applyMode).toHaveBeenCalledWith("player");
  });

  it("registerView replays the current mode onto the view", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.setMode("player");

    const spy = makeViewSpy();
    ctrl.registerView(spy);

    expect(spy.applyMode).toHaveBeenCalledOnce();
    expect(spy.applyMode).toHaveBeenCalledWith("player");
  });

  it("registerView with default mode replays editor", () => {
    const ctrl = new EditorViewControllerImpl();
    const spy = makeViewSpy();
    ctrl.registerView(spy);
    expect(spy.applyMode).toHaveBeenCalledWith("editor");
  });
});

// ── Element selection ─────────────────────────────────────────────────────────

describe("element selection — initial state", () => {
  it("element selection is empty initially", () => {
    const ctrl = new EditorViewControllerImpl();
    expect(ctrl.selection.elements.size).toBe(0);
  });

  it("hasElement() returns false for an element that was never added", () => {
    const ctrl = new EditorViewControllerImpl();
    expect(ctrl.selection.hasElement(makeEl())).toBe(false);
  });
});

describe("element selection — addElement", () => {
  it("addElement() makes hasElement() return true", () => {
    const ctrl = new EditorViewControllerImpl();
    const el = makeEl();
    ctrl.selection.addElement(el);
    expect(ctrl.selection.hasElement(el)).toBe(true);
  });

  it("addElement() increases elements.size", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.addElement(makeEl());
    ctrl.selection.addElement(makeEl());
    expect(ctrl.selection.elements.size).toBe(2);
  });

  it("addElement() is idempotent — adding the same element twice fires selection:changed only once", () => {
    const ctrl = new EditorViewControllerImpl();
    const el = makeEl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.addElement(el);
    ctrl.selection.addElement(el);

    expect(listener).toHaveBeenCalledOnce();
  });
});

describe("element selection — removeElement", () => {
  it("removeElement() makes hasElement() return false", () => {
    const ctrl = new EditorViewControllerImpl();
    const el = makeEl();
    ctrl.selection.addElement(el);
    ctrl.selection.removeElement(el);
    expect(ctrl.selection.hasElement(el)).toBe(false);
  });

  it("removeElement() of an absent element fires no event", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.removeElement(makeEl());

    expect(listener).not.toHaveBeenCalled();
  });

  it("removeElement() does not affect other selected elements", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();
    ctrl.selection.addElement(el1);
    ctrl.selection.addElement(el2);

    ctrl.selection.removeElement(el1);

    expect(ctrl.selection.hasElement(el1)).toBe(false);
    expect(ctrl.selection.hasElement(el2)).toBe(true);
  });
});

describe("element selection — setElements", () => {
  it("setElements() replaces the entire element selection", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();
    ctrl.selection.addElement(el1);

    ctrl.selection.setElements([el2]);

    expect(ctrl.selection.hasElement(el1)).toBe(false);
    expect(ctrl.selection.hasElement(el2)).toBe(true);
  });

  it("setElements() fires selection:changed exactly once", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.setElements([makeEl(), makeEl()]);

    expect(listener).toHaveBeenCalledOnce();
  });

  it("setElements([]) is equivalent to clear()", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.addElement(makeEl());
    ctrl.selection.setElements([]);
    expect(ctrl.selection.elements.size).toBe(0);
  });
});

describe("element selection — clear", () => {
  it("clear() empties the element selection", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.addElement(makeEl());
    ctrl.selection.clear();
    expect(ctrl.selection.elements.size).toBe(0);
  });

  it("clear() fires selection:changed", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.addElement(makeEl());
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.clear();

    expect(listener).toHaveBeenCalledOnce();
  });

  it("clear() when already empty fires no event", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.clear();

    expect(listener).not.toHaveBeenCalled();
  });
});

// ── Section selection ─────────────────────────────────────────────────────────

describe("section selection — addSection", () => {
  it("addSection() makes hasSection() return true", () => {
    const ctrl = new EditorViewControllerImpl();
    const sec = makeSec();
    ctrl.selection.addSection(sec);
    expect(ctrl.selection.hasSection(sec)).toBe(true);
  });

  it("addSection() is idempotent — adding the same section twice fires selection:changed only once", () => {
    const ctrl = new EditorViewControllerImpl();
    const sec = makeSec();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.addSection(sec);
    ctrl.selection.addSection(sec);

    expect(listener).toHaveBeenCalledOnce();
  });
});

describe("section selection — removeSection", () => {
  it("removeSection() makes hasSection() return false", () => {
    const ctrl = new EditorViewControllerImpl();
    const sec = makeSec();
    ctrl.selection.addSection(sec);
    ctrl.selection.removeSection(sec);
    expect(ctrl.selection.hasSection(sec)).toBe(false);
  });

  it("removeSection() of an absent section fires no event", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.removeSection(makeSec());

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("section selection — setSections", () => {
  it("setSections() replaces the entire section selection", () => {
    const ctrl = new EditorViewControllerImpl();
    const s1 = makeSec();
    const s2 = makeSec();
    ctrl.selection.addSection(s1);

    ctrl.selection.setSections([s2]);

    expect(ctrl.selection.hasSection(s1)).toBe(false);
    expect(ctrl.selection.hasSection(s2)).toBe(true);
  });
});

// ── Mutual exclusivity ────────────────────────────────────────────────────────

describe("mutual exclusivity — elements and sections cannot coexist", () => {
  it("addElement() clears selected sections", () => {
    const ctrl = new EditorViewControllerImpl();
    const sec = makeSec();
    const el = makeEl();
    ctrl.selection.addSection(sec);

    ctrl.selection.addElement(el);

    expect(ctrl.selection.hasSection(sec)).toBe(false);
    expect(ctrl.selection.hasElement(el)).toBe(true);
  });

  it("addSection() clears selected elements", () => {
    const ctrl = new EditorViewControllerImpl();
    const el = makeEl();
    const sec = makeSec();
    ctrl.selection.addElement(el);

    ctrl.selection.addSection(sec);

    expect(ctrl.selection.hasElement(el)).toBe(false);
    expect(ctrl.selection.hasSection(sec)).toBe(true);
  });

  it("addElement() when sections are present fires only one selection:changed", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.addSection(makeSec());
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.addElement(makeEl());

    expect(listener).toHaveBeenCalledOnce();
  });

  it("setElements() clears sections", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.addSection(makeSec());

    ctrl.selection.setElements([makeEl()]);

    expect(ctrl.selection.sections.size).toBe(0);
  });

  it("setSections() clears elements", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.addElement(makeEl());

    ctrl.selection.setSections([makeSec()]);

    expect(ctrl.selection.elements.size).toBe(0);
  });
});

// ── selection:changed payload ─────────────────────────────────────────────────

describe("selection:changed payload", () => {
  it("payload carries the full current element set", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();

    let received: ReadonlySet<Element> | null = null;
    ctrl.events.on("selection:changed", ({ elements }) => {
      received = elements;
    });

    ctrl.selection.setElements([el1, el2]);

    expect(received!.has(el1)).toBe(true);
    expect(received!.has(el2)).toBe(true);
    expect(received!.size).toBe(2);
  });

  it("payload after removeElement reflects the post-remove state", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();
    ctrl.selection.addElement(el1);
    ctrl.selection.addElement(el2);

    let received: ReadonlySet<Element> | null = null;
    ctrl.events.on("selection:changed", ({ elements }) => {
      received = elements;
    });

    ctrl.selection.removeElement(el1);

    expect(received!.has(el1)).toBe(false);
    expect(received!.has(el2)).toBe(true);
  });

  it("payload carries the full current section set", () => {
    const ctrl = new EditorViewControllerImpl();
    const s1 = makeSec();
    const s2 = makeSec();

    let received: ReadonlySet<Section> | null = null;
    ctrl.events.on("selection:changed", ({ sections }) => {
      received = sections;
    });

    ctrl.selection.setSections([s1, s2]);

    expect(received!.has(s1)).toBe(true);
    expect(received!.has(s2)).toBe(true);
    expect(received!.size).toBe(2);
  });
});

// ── events.on / unsubscribe ──────────────────────────────────────────────────

describe("events", () => {
  it("events.on returns an unsubscribe function that stops delivery", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    const unsubscribe = ctrl.events.on("selection:changed", listener);

    ctrl.selection.addElement(makeEl());
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    ctrl.selection.addElement(makeEl());
    expect(listener).toHaveBeenCalledOnce(); // still just once
  });

  it("emit() routes arbitrary events to subscribers", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    ctrl.events.on("key:down", listener);

    const fakeEvent = new KeyboardEvent("keydown", { key: "Delete" });
    ctrl.emit("key:down", { source: fakeEvent });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ source: fakeEvent });
  });
});
