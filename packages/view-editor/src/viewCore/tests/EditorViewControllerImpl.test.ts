/**
 * Unit tests for EditorViewControllerImpl.
 *
 * These tests cover the controller in isolation — no DOM, no p4 model.
 * The controller owns mode and selection state independently of the view,
 * so the full surface is testable here without any rendering infrastructure.
 */

import { describe, it, expect, vi } from "vitest";
import { EditorViewControllerImpl } from "../EditorViewControllerImpl";
import type { Element } from "@rippledoc/presentation4/viewAPI";

// A minimal stand-in for AttachedView — satisfies the structural interface.
const makeViewSpy = () => ({ applyMode: vi.fn() });

// Identity is all that matters for selection; any object works as a stand-in.
const makeEl = () => ({}) as unknown as Element;

// ── Mode ─────────────────────────────────────────────────────────────────────

describe("mode — initial state and basic updates", () => {
  it("starts in editor mode", () => {
    const ctrl = new EditorViewControllerImpl();
    expect(ctrl.mode).toBe("editor");
  });

  it("setMode updates the mode getter", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.setMode("anchors");
    expect(ctrl.mode).toBe("anchors");
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
    expect(() => ctrl.setMode("anchors")).not.toThrow();
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

    ctrl.setMode("anchors");

    expect(spy.applyMode).toHaveBeenCalledOnce();
    expect(spy.applyMode).toHaveBeenCalledWith("anchors");
  });

  it("registerView replays the current mode onto the view", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.setMode("anchors");

    const spy = makeViewSpy();
    ctrl.registerView(spy);

    expect(spy.applyMode).toHaveBeenCalledOnce();
    expect(spy.applyMode).toHaveBeenCalledWith("anchors");
  });

  it("registerView with default mode replays editor", () => {
    const ctrl = new EditorViewControllerImpl();
    const spy = makeViewSpy();
    ctrl.registerView(spy);
    expect(spy.applyMode).toHaveBeenCalledWith("editor");
  });
});

// ── Selection ─────────────────────────────────────────────────────────────────

describe("selection — initial state", () => {
  it("selection is empty initially", () => {
    const ctrl = new EditorViewControllerImpl();
    expect(ctrl.selection.elements.size).toBe(0);
  });

  it("has() returns false for an element that was never added", () => {
    const ctrl = new EditorViewControllerImpl();
    expect(ctrl.selection.has(makeEl())).toBe(false);
  });
});

describe("selection — add", () => {
  it("add() makes has() return true", () => {
    const ctrl = new EditorViewControllerImpl();
    const el = makeEl();
    ctrl.selection.add(el);
    expect(ctrl.selection.has(el)).toBe(true);
  });

  it("add() increases elements.size", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.add(makeEl());
    ctrl.selection.add(makeEl());
    expect(ctrl.selection.elements.size).toBe(2);
  });

  it("add() is idempotent — adding the same element twice fires selection:changed only once", () => {
    const ctrl = new EditorViewControllerImpl();
    const el = makeEl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.add(el);
    ctrl.selection.add(el);

    expect(listener).toHaveBeenCalledOnce();
  });
});

describe("selection — remove", () => {
  it("remove() makes has() return false", () => {
    const ctrl = new EditorViewControllerImpl();
    const el = makeEl();
    ctrl.selection.add(el);
    ctrl.selection.remove(el);
    expect(ctrl.selection.has(el)).toBe(false);
  });

  it("remove() of an absent element fires no event", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.remove(makeEl());

    expect(listener).not.toHaveBeenCalled();
  });

  it("remove() does not affect other selected elements", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();
    ctrl.selection.add(el1);
    ctrl.selection.add(el2);

    ctrl.selection.remove(el1);

    expect(ctrl.selection.has(el1)).toBe(false);
    expect(ctrl.selection.has(el2)).toBe(true);
  });
});

describe("selection — set", () => {
  it("set() replaces the entire selection", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();
    ctrl.selection.add(el1);

    ctrl.selection.set([el2]);

    expect(ctrl.selection.has(el1)).toBe(false);
    expect(ctrl.selection.has(el2)).toBe(true);
  });

  it("set() fires selection:changed exactly once", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    ctrl.events.on("selection:changed", listener);

    ctrl.selection.set([makeEl(), makeEl()]);

    expect(listener).toHaveBeenCalledOnce();
  });

  it("set([]) is equivalent to clear()", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.add(makeEl());
    ctrl.selection.set([]);
    expect(ctrl.selection.elements.size).toBe(0);
  });
});

describe("selection — clear", () => {
  it("clear() empties the selection", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.add(makeEl());
    ctrl.selection.clear();
    expect(ctrl.selection.elements.size).toBe(0);
  });

  it("clear() fires selection:changed", () => {
    const ctrl = new EditorViewControllerImpl();
    ctrl.selection.add(makeEl());
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

describe("selection — selection:changed payload", () => {
  it("payload carries the full current selection set", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();

    let received: ReadonlySet<Element> | null = null;
    ctrl.events.on("selection:changed", ({ selection }) => {
      received = selection;
    });

    ctrl.selection.set([el1, el2]);

    expect(received!.has(el1)).toBe(true);
    expect(received!.has(el2)).toBe(true);
    expect(received!.size).toBe(2);
  });

  it("payload after remove reflects the post-remove state", () => {
    const ctrl = new EditorViewControllerImpl();
    const el1 = makeEl();
    const el2 = makeEl();
    ctrl.selection.add(el1);
    ctrl.selection.add(el2);

    let received: ReadonlySet<Element> | null = null;
    ctrl.events.on("selection:changed", ({ selection }) => {
      received = selection;
    });

    ctrl.selection.remove(el1);

    expect(received!.has(el1)).toBe(false);
    expect(received!.has(el2)).toBe(true);
  });
});

// ── events.on / unsubscribe ──────────────────────────────────────────────────

describe("events", () => {
  it("events.on returns an unsubscribe function that stops delivery", () => {
    const ctrl = new EditorViewControllerImpl();
    const listener = vi.fn();
    const unsubscribe = ctrl.events.on("selection:changed", listener);

    ctrl.selection.add(makeEl());
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    ctrl.selection.add(makeEl());
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
