/**
 * Unit tests for EditorPinManager.
 *
 * EditorPinManager implements a 4-state machine per pin:
 *   start        → pinForward:   clone shown, original hidden
 *   end          → unpinForward: original restored + translateY applied; deltaY grows
 *   reverseStart → pinReverse:   deltaY decremented, clone shown, original hidden
 *   reverseEnd   → unpinReverse: original restored with pre-pin deltaY
 *
 * Tests use minimal stubs for p4.ElementViewOwner and EditorPresentationView —
 * no real p4 model or full DOM hierarchy is needed.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { EditorPinManager } from "../views/EditorPinManager";
import { EditorViewControllerImpl } from "../EditorViewControllerImpl";
import type * as p4 from "@rippledoc/presentation4/viewAPI";
import type { EditorPresentationView } from "../views/EditorPresentationView";

// ── Stubs ────────────────────────────────────────────────────────────────────

/**
 * A ScrollTrigger stub that lets tests fire events directly. The `fire` method
 * is extra-structural; callers must cast `pin.trigger` to `FireableTrigger` to
 * reach it.
 */
type FireableTrigger = p4.ScrollTrigger & {
  fire(event: "start" | "end" | "reverseStart" | "reverseEnd"): void;
};

function makeTrigger(top: number, height: number): FireableTrigger {
  const cbs: Partial<Record<string, Array<() => void>>> = {};
  return {
    get top() {
      return top;
    },
    get height() {
      return height;
    },
    get bottom() {
      return top + height;
    },
    get left() {
      return 0;
    },
    get right() {
      return 0;
    },
    get width() {
      return 0;
    },
    get anchors() {
      return {} as p4.XYAnchors;
    },
    get name() {
      return "";
    },
    setVerticalAnchors() {},
    on(_event: string, listener: () => void) {
      (cbs[_event] ??= []).push(listener);
      return () => {};
    },
    fire(event: string) {
      cbs[event]?.forEach((fn) => fn());
    },
  } as unknown as FireableTrigger;
}

function makePin(
  top: number,
  height: number,
): p4.Pin & { ft: FireableTrigger } {
  const ft = makeTrigger(top, height);
  return { trigger: ft, ft } as unknown as p4.Pin & { ft: FireableTrigger };
}

function makeOwner(
  pins: p4.Pin[],
  anchors = { left: 10, top: 20, width: 100, height: 50 },
  scale = 1,
  tx = 0,
): p4.ElementViewOwner {
  return {
    animations: { pins },
    anchors: {
      left: { value: anchors.left },
      top: { value: anchors.top },
      width: { value: anchors.width },
      height: { value: anchors.height },
    },
    sectionViewOwner: {
      presentationViewOwner: {
        layoutTransform: { scale, tx },
      },
    },
    contentDependentDimension: "none",
  } as unknown as p4.ElementViewOwner;
}

function makePresentationView(
  ctrl: EditorViewControllerImpl,
  pinsContainer: HTMLElement,
): EditorPresentationView {
  return {
    pinsContainer,
    controller: ctrl,
    dom: { viewportContainer: document.createElement("div") },
  } as unknown as EditorPresentationView;
}

// ── Setup ────────────────────────────────────────────────────────────────────

let ctrl: EditorViewControllerImpl;
let pinsContainer: HTMLElement;
let sectionContent: HTMLElement;
let elementDiv: HTMLElement;

beforeEach(() => {
  ctrl = new EditorViewControllerImpl();
  pinsContainer = document.createElement("div");
  sectionContent = document.createElement("div");
  elementDiv = document.createElement("div");
  elementDiv.classList.add("element");
  sectionContent.appendChild(elementDiv);
});

function build(pins: p4.Pin[], owner?: p4.ElementViewOwner): EditorPinManager {
  const o = owner ?? makeOwner(pins);
  const pv = makePresentationView(ctrl, pinsContainer);
  return new EditorPinManager({ elementDiv, owner: o, presentationView: pv });
}

/** The current clone in the pins overlay. */
function clone(): HTMLElement {
  return pinsContainer.firstElementChild as HTMLElement;
}

/** The wrapper that replaced elementDiv in sectionContent. */
function wrapper(): HTMLElement {
  return sectionContent.firstElementChild as HTMLElement;
}

// ── Construction ─────────────────────────────────────────────────────────────

describe("construction", () => {
  it("hasPins returns true", () => {
    const pm = build([makePin(0, 100)]);
    expect(pm.hasPins).toBe(true);
  });

  it("wraps elementDiv in a .rdoc-pin-wrapper inside sectionContent", () => {
    build([makePin(0, 100)]);
    expect(wrapper().classList.contains("rdoc-pin-wrapper")).toBe(true);
    // elementDiv is now inside the wrapper, not directly in sectionContent
    expect(wrapper().contains(elementDiv)).toBe(true);
  });

  it("appends a hidden placeholder clone to pinsContainer", () => {
    build([makePin(0, 100)]);
    expect(pinsContainer.childElementCount).toBe(1);
    expect(clone().style.visibility).toBe("hidden");
  });
});

// ── pinForward (trigger: start) ───────────────────────────────────────────────

describe("pinForward — trigger start", () => {
  it("shows the clone and hides the original", () => {
    const pin = makePin(0, 100);
    build([pin]);

    pin.ft.fire("start");

    expect(clone().style.visibility).toBe("visible");
    expect(elementDiv.style.visibility).toBe("hidden");
  });

  it("replaces the placeholder with a fresh clone of the live element", () => {
    const pin = makePin(0, 100);
    build([pin]);
    const placeholder = clone();

    elementDiv.classList.add("marker");
    pin.ft.fire("start");

    expect(clone()).not.toBe(placeholder);
    expect(clone().classList.contains("marker")).toBe(true);
  });

  it("positions the clone at the element's virtual coordinates (scale=1, tx=0, deltaY=0)", () => {
    // anchor top=20, trigger top=0 → clone top = (0 + 20 − 0) * 1 = 20
    const pin = makePin(0, 100);
    build([pin]);

    pin.ft.fire("start");

    expect(parseFloat(clone().style.top)).toBe(20);
    expect(parseFloat(clone().style.left)).toBe(10);
    expect(parseFloat(clone().style.width)).toBe(100);
    expect(parseFloat(clone().style.height)).toBe(50);
  });
});

// ── unpinForward (trigger: end) ───────────────────────────────────────────────

describe("unpinForward — trigger end", () => {
  it("hides the clone and restores the original", () => {
    const pin = makePin(0, 100);
    build([pin]);

    pin.ft.fire("start");
    pin.ft.fire("end");

    expect(clone().style.visibility).toBe("hidden");
    expect(elementDiv.style.visibility).toBe("");
  });

  it("applies translateY of trigger.height to the wrapper", () => {
    // deltaY_ after end = 200; scale=1 → translateY(200.00px)
    const pin = makePin(0, 200);
    build([pin]);

    pin.ft.fire("start");
    pin.ft.fire("end");

    expect(wrapper().style.transform).toBe("translateY(200.00px)");
  });

  it("deltaY accumulates correctly across two sequential pins", () => {
    const pin1 = makePin(0, 100);
    const pin2 = makePin(300, 150);
    build([pin1, pin2]);

    pin1.ft.fire("start");
    pin1.ft.fire("end"); // deltaY = 100
    pin2.ft.fire("start");
    pin2.ft.fire("end"); // deltaY = 250

    expect(wrapper().style.transform).toBe("translateY(250.00px)");
  });
});

// ── pinReverse (trigger: reverseStart) ────────────────────────────────────────

describe("pinReverse — trigger reverseStart", () => {
  it("shows the clone and hides the original", () => {
    const pin = makePin(0, 100);
    build([pin]);

    pin.ft.fire("start");
    pin.ft.fire("end");
    pin.ft.fire("reverseStart");

    expect(clone().style.visibility).toBe("visible");
    expect(elementDiv.style.visibility).toBe("hidden");
  });

  it("decrements deltaY before positioning so the clone sits in the correct position", () => {
    // After forward cycle: deltaY = 100. reverseStart decrements to 0 so clone
    // is positioned as if we had never accumulated that offset.
    const pin = makePin(0, 100);
    const owner = makeOwner([pin], { left: 0, top: 0, width: 100, height: 50 });
    build([pin], owner);

    pin.ft.fire("start");
    pin.ft.fire("end"); // deltaY = 100
    pin.ft.fire("reverseStart"); // deltaY decremented to 0, then positionClone_

    // top = (0 + 0 - 0) * 1 = 0 (not 100)
    expect(parseFloat(clone().style.top)).toBe(0);
  });
});

// ── unpinReverse (trigger: reverseEnd) ────────────────────────────────────────

describe("unpinReverse — trigger reverseEnd", () => {
  it("restores the original and hides the clone", () => {
    const pin = makePin(0, 100);
    build([pin]);

    pin.ft.fire("start");
    pin.ft.fire("end");
    pin.ft.fire("reverseStart");
    pin.ft.fire("reverseEnd");

    expect(clone().style.visibility).toBe("hidden");
    expect(elementDiv.style.visibility).toBe("");
  });

  it("restores deltaY to the pre-pin value (full round-trip returns to 0)", () => {
    const pin = makePin(0, 100);
    build([pin]);

    pin.ft.fire("start");
    pin.ft.fire("end"); // deltaY = 100 → translateY(100.00px)
    pin.ft.fire("reverseStart"); // deltaY = 0
    pin.ft.fire("reverseEnd"); // translateY(0.00px)

    expect(wrapper().style.transform).toBe("translateY(0.00px)");
  });
});

// ── Selection and focus chrome on the clone ────────────────────────────────────

describe("selection chrome — clone sync", () => {
  it("adds 'selected' to the clone when pinned and selection matches", () => {
    const pin = makePin(0, 100);
    const owner = makeOwner([pin]);
    build([pin], owner);

    pin.ft.fire("start");
    ctrl.emit("selection:changed", {
      elements: new Set([owner]) as unknown as ReadonlySet<p4.Element>,
      sections: new Set() as ReadonlySet<p4.Section>,
      triggers: new Set() as ReadonlySet<p4.ScrollTrigger>,
    });

    expect(clone().classList.contains("selected")).toBe(true);
  });

  it("does not update the clone's class when not pinned", () => {
    const pin = makePin(0, 100);
    const owner = makeOwner([pin]);
    build([pin], owner);

    // No pin active — selection event should not touch the clone.
    ctrl.emit("selection:changed", {
      elements: new Set([owner]) as unknown as ReadonlySet<p4.Element>,
      sections: new Set() as ReadonlySet<p4.Section>,
      triggers: new Set() as ReadonlySet<p4.ScrollTrigger>,
    });

    expect(clone().classList.contains("selected")).toBe(false);
  });
});

describe("focus chrome — clone sync", () => {
  it("adds 'focused' to the clone when pinned and focus matches", () => {
    const pin = makePin(0, 100);
    const owner = makeOwner([pin]);
    build([pin], owner);

    pin.ft.fire("start");
    ctrl.emit("focus:changed", {
      focused: true,
      element: owner as unknown as p4.Element,
    });

    expect(clone().classList.contains("focused")).toBe(true);
  });
});

// ── disconnect ────────────────────────────────────────────────────────────────

describe("disconnect", () => {
  it("moves elementDiv back to its original position in sectionContent", () => {
    const pin = makePin(0, 100);
    const pm = build([pin]);

    pm.disconnect();

    expect(sectionContent.firstElementChild).toBe(elementDiv);
  });

  it("removes the clone from pinsContainer", () => {
    const pin = makePin(0, 100);
    const pm = build([pin]);

    pm.disconnect();

    expect(pinsContainer.childElementCount).toBe(0);
  });

  it("after disconnect, selection events no longer touch the clone", () => {
    const pin = makePin(0, 100);
    const owner = makeOwner([pin]);
    const pm = build([pin], owner);

    pin.ft.fire("start");
    pm.disconnect();

    // This would have toggled "selected" on the clone if still subscribed.
    ctrl.emit("selection:changed", {
      elements: new Set([owner]) as unknown as ReadonlySet<p4.Element>,
      sections: new Set() as ReadonlySet<p4.Section>,
      triggers: new Set() as ReadonlySet<p4.ScrollTrigger>,
    });

    // Clone is detached and gone; pinsContainer is empty — no throw, no side-effect.
    expect(pinsContainer.childElementCount).toBe(0);
  });
});
