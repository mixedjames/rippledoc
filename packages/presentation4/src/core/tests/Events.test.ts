/**
 * Tests for the presentation4 event system.
 *
 * Covers: structural events, content events, anchor propagation,
 * layout events, session mode, disabled mode, and unsubscribe.
 */

import { describe, it, expect, vi } from "vitest";
import { CorePresentation } from "../CorePresentation";
import { constant, offsetFrom } from "../../anchors/factories";

// ── Structural events ─────────────────────────────────────────────────────────

describe("section:added / section:removed", () => {
  it("fires section:added with the new section and its index", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("section:added", listener);

    const s = p.root.addSection();
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ section: s, index: 0 });
  });

  it("index increments for each added section", () => {
    const p = new CorePresentation();
    const indices: number[] = [];
    p.events.on("section:added", ({ index }) => indices.push(index));

    p.root.addSection();
    p.root.addSection();
    p.root.addSection();
    expect(indices).toEqual([0, 1, 2]);
  });

  it("fires section:removed with the removed section and its former index", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("section:removed", listener);

    const s0 = p.root.addSection();
    const s1 = p.root.addSection();
    p.root.removeSection(s0);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ section: s0, index: 0 });
    void s1; // used for setup
  });
});

describe("element:added / element:removed", () => {
  it("fires element:added for each element type", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("element:added", listener);

    const s = p.root.addSection();
    const md = s.addMarkdownElement("hi");
    const bmp = s.addBitmapImageElement();
    const svg = s.addSVGImageElement();

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenNthCalledWith(1, { element: md, section: s, index: 0 });
    expect(listener).toHaveBeenNthCalledWith(2, { element: bmp, section: s, index: 1 });
    expect(listener).toHaveBeenNthCalledWith(3, { element: svg, section: s, index: 2 });
  });

  it("fires element:removed with the element, its section, and its former index", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("element:removed", listener);

    const s = p.root.addSection();
    const el = s.addMarkdownElement();
    s.removeElement(el);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ element: el, section: s, index: 0 });
  });
});

// ── Content events ────────────────────────────────────────────────────────────

describe("element:markdownChanged", () => {
  it("fires with the element and new markdown value", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("element:markdownChanged", listener);

    const s = p.root.addSection();
    const el = s.addMarkdownElement();
    el.setMarkdown("# New content");

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ element: el, markdown: "# New content" });
  });
});

describe("element:srcChanged / element:altChanged", () => {
  it("fires element:srcChanged for BitmapImageElement", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("element:srcChanged", listener);

    const s = p.root.addSection();
    const el = s.addBitmapImageElement();
    el.setSrc("photo.jpg");

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ element: el, src: "photo.jpg" });
  });

  it("fires element:altChanged for BitmapImageElement", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("element:altChanged", listener);

    const s = p.root.addSection();
    const el = s.addBitmapImageElement();
    el.setAlt("A descriptive label");

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ element: el, alt: "A descriptive label" });
  });

  it("fires element:srcChanged for SVGImageElement", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("element:srcChanged", listener);

    const s = p.root.addSection();
    const el = s.addSVGImageElement();
    el.setSrc("chart.svg");

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ element: el, src: "chart.svg" });
  });
});

// ── Anchor events ─────────────────────────────────────────────────────────────

describe("anchors:changed — direct emission", () => {
  it("fires for a section when setVerticalAnchors is called", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("anchors:changed", listener);

    const s = p.root.addSection();
    listener.mockClear(); // ignore any events from addSection
    s.setVerticalAnchors({ top: constant(0), height: constant(500) });

    expect(listener).toHaveBeenCalledWith({ target: s });
  });

  it("fires for an element when setHorizontalAnchors is called", () => {
    const p = new CorePresentation();
    const s = p.root.addSection();
    const el = s.addMarkdownElement();

    const listener = vi.fn();
    p.events.on("anchors:changed", listener);
    el.setHorizontalAnchors({ left: constant(0), width: constant(200) });

    expect(listener).toHaveBeenCalledWith({ target: el });
  });

  it("fires for an element when setVerticalAnchors is called", () => {
    const p = new CorePresentation();
    const s = p.root.addSection();
    const el = s.addMarkdownElement();

    const listener = vi.fn();
    p.events.on("anchors:changed", listener);
    el.setVerticalAnchors({ top: constant(10), height: constant(80) });

    expect(listener).toHaveBeenCalledWith({ target: el });
  });
});

describe("anchors:changed — dependency propagation", () => {
  it("notifies a dependent element when the section anchor it references changes", () => {
    const p = new CorePresentation();
    const s = p.root.addSection();
    s.setVerticalAnchors({ top: constant(0), height: constant(300) });

    const el = s.addMarkdownElement();
    // Element's top depends on the section's top anchor.
    el.setVerticalAnchors({
      top: offsetFrom(s.anchors.top, 20),
      height: constant(60),
    });

    const targets: unknown[] = [];
    p.events.on("anchors:changed", ({ target }) => targets.push(target));

    // Changing the section's vertical anchors changes section.top, which
    // element.top depends on — so both should be notified.
    s.setVerticalAnchors({ top: constant(100), height: constant(300) });

    expect(targets).toContain(s);
    expect(targets).toContain(el);
  });

  it("does not double-emit for the directly changed object", () => {
    const p = new CorePresentation();
    const s = p.root.addSection();
    s.setVerticalAnchors({ top: constant(0), height: constant(300) });

    const listener = vi.fn();
    p.events.on("anchors:changed", listener);

    s.setVerticalAnchors({ top: constant(50), height: constant(300) });

    const sectionCalls = listener.mock.calls.filter(
      ([{ target }]) => target === s,
    );
    expect(sectionCalls).toHaveLength(1);
  });
});

// ── Layout events ─────────────────────────────────────────────────────────────

describe("layout:added", () => {
  it("fires when a layout is added", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("layout:added", listener);

    const layout = p.layout.addLayout({ basisWidth: 1920, basisHeight: 1080 });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ layout });
  });
});

describe("layout:activeChanged", () => {
  it("fires when the active layout is switched", () => {
    const p = new CorePresentation();
    const layout = p.layout.addLayout({ basisWidth: 1920, basisHeight: 1080 });

    const listener = vi.fn();
    p.events.on("layout:activeChanged", listener);

    p.layout.setActiveLayout(layout);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ layout });
  });
});

// ── Unsubscribe ───────────────────────────────────────────────────────────────

describe("unsubscribe", () => {
  it("on() returns a function that stops delivery when called", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    const unsubscribe = p.events.on("section:added", listener);

    p.root.addSection();
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    p.root.addSection();
    expect(listener).toHaveBeenCalledOnce(); // still just once
  });
});

// ── Session mode ──────────────────────────────────────────────────────────────

describe("session mode", () => {
  it("buffers events during a session and emits none until endSession", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("section:added", listener);

    p.events.beginSession();
    p.root.addSection();
    p.root.addSection();
    expect(listener).not.toHaveBeenCalled();

    p.events.endSession();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("replays buffered events in emission order", () => {
    const p = new CorePresentation();
    const events: string[] = [];
    p.events.on("section:added", () => events.push("section"));
    p.events.on("element:added", () => events.push("element"));

    p.events.beginSession();
    const s = p.root.addSection();
    s.addMarkdownElement();
    p.events.endSession();

    expect(events).toEqual(["section", "element"]);
  });

  it("resumes normal emission after endSession", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("section:added", listener);

    p.events.beginSession();
    p.root.addSection();
    p.events.endSession();
    listener.mockClear();

    p.root.addSection();
    expect(listener).toHaveBeenCalledOnce();
  });
});

// ── withEventsDisabled ────────────────────────────────────────────────────────

describe("withEventsDisabled", () => {
  it("suppresses all events during the callback", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("section:added", listener);

    p.events.withEventsDisabled(() => {
      p.root.addSection();
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it("resumes normal emission after the callback returns", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("section:added", listener);

    p.events.withEventsDisabled(() => {
      p.root.addSection();
    });
    p.root.addSection();

    expect(listener).toHaveBeenCalledOnce();
  });

  it("restores the previous mode if called during a session", () => {
    const p = new CorePresentation();
    const listener = vi.fn();
    p.events.on("section:added", listener);

    p.events.beginSession();
    p.events.withEventsDisabled(() => {
      p.root.addSection(); // suppressed — not buffered, not emitted
    });
    // We're back in session mode; this one is buffered.
    p.root.addSection();
    expect(listener).not.toHaveBeenCalled();

    p.events.endSession();
    // Only the buffered event fires, not the suppressed one.
    expect(listener).toHaveBeenCalledOnce();
  });
});
