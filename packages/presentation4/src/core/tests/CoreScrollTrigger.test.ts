import { describe, it, expect } from "vitest";
import { CorePresentation } from "../CorePresentation";
import { constant, offsetFrom } from "../../anchors/factories";
import { GeometryConstraintError } from "../../anchors/GeometryConstraintError";

// Tests use CorePresentation directly to access notifyScrolled, which is a
// view-layer method on PresentationViewOwner not visible through Presentation.
function makeP(basisHeight = 1000) {
  return new CorePresentation({ basisWidth: 1000, basisHeight });
}

// ── Anchor constraint tests ───────────────────────────────────────────────────

describe("ScrollTrigger — vertical anchors", () => {
  it("derives bottom from top + height", () => {
    const p = makeP(800);
    const trigger = p.addScrollTrigger({
      top: constant(100),
      height: constant(300),
      name: "intro",
    });

    expect(trigger.name).toBe("intro");
    expect(trigger.top).toBe(100);
    expect(trigger.height).toBe(300);
    expect(trigger.bottom).toBe(400);
  });

  it("derives top from bottom - height", () => {
    const p = makeP(800);
    const trigger = p.addScrollTrigger({
      bottom: constant(500),
      height: constant(200),
    });

    expect(trigger.top).toBe(300);
    expect(trigger.bottom).toBe(500);
    expect(trigger.height).toBe(200);
  });

  it("derives height from bottom - top", () => {
    const p = makeP(800);
    const trigger = p.addScrollTrigger({
      top: constant(100),
      bottom: constant(600),
    });

    expect(trigger.top).toBe(100);
    expect(trigger.bottom).toBe(600);
    expect(trigger.height).toBe(500);
  });

  it("supports dynamic anchor expressions referencing section anchors", () => {
    const p = makeP(800);
    const section = p.root.addSection();
    section.setVerticalAnchors({ top: constant(200), height: constant(400) });

    const trigger = p.addScrollTrigger({
      top: offsetFrom(section.anchors.top, 50),
      height: constant(100),
    });

    // Trigger top is 50px below the section's top.
    expect(trigger.top).toBe(250);
    expect(trigger.bottom).toBe(350);
  });

  it("setVerticalAnchors replaces constraints on the active layout", () => {
    const p = makeP(800);
    const section = p.root.addSection();
    section.setVerticalAnchors({ top: constant(0), height: constant(800) });

    const trigger = p.addScrollTrigger({
      top: constant(50),
      bottom: constant(250),
    });

    trigger.setVerticalAnchors({
      top: offsetFrom(section.anchors.top, 20),
      height: constant(180),
    });

    expect(trigger.top).toBe(20);
    expect(trigger.height).toBe(180);
    expect(trigger.bottom).toBe(200);
  });

  it("throws GeometryConstraintError when fewer than two vertical constraints are given", () => {
    const p = makeP(800);

    expect(() => {
      p.addScrollTrigger({ top: constant(10) });
    }).toThrow(GeometryConstraintError);
  });

  it("throws GeometryConstraintError when all three vertical constraints are given", () => {
    const p = makeP(800);

    expect(() => {
      p.addScrollTrigger({
        top: constant(0),
        bottom: constant(100),
        height: constant(100),
      });
    }).toThrow(GeometryConstraintError);
  });

  it("horizontal anchors are always 0", () => {
    const p = makeP(800);
    const trigger = p.addScrollTrigger({
      top: constant(0),
      height: constant(100),
    });

    expect(trigger.left).toBe(0);
    expect(trigger.right).toBe(0);
    expect(trigger.width).toBe(0);
  });
});

// ── Scroll state machine tests ────────────────────────────────────────────────

describe("ScrollTrigger — scroll state machine", () => {
  function makePresentation() {
    const p = makeP();
    // Trigger: top=100, bottom=300 (height=200)
    const trigger = p.addScrollTrigger({
      top: constant(100),
      height: constant(200),
    });
    return { p, trigger };
  }

  it("emits start then scroll when entering from above", () => {
    const { p, trigger } = makePresentation();
    const log: string[] = [];

    trigger.on("start", ({ progress }) => log.push(`start:${progress}`));
    trigger.on("scroll", ({ progress }) => log.push(`scroll:${progress}`));
    trigger.on("end", ({ progress }) => log.push(`end:${progress}`));

    p.notifyScrolled(50); // before
    p.notifyScrolled(100); // enter at startY — becomes active (progress=0)
    p.notifyScrolled(200); // mid

    expect(log[0]).toMatch(/^start:/);
    expect(log[1]).toMatch(/^scroll:0$/);
    expect(log[2]).toMatch(/^scroll:/);
    expect(log).not.toContain(expect.stringMatching(/^end:/));
  });

  it("emits end after scroll when exiting downward", () => {
    const { p, trigger } = makePresentation();
    const log: string[] = [];

    trigger.on("scroll", ({ progress }) => log.push(`scroll:${progress}`));
    trigger.on("end", ({ progress }) => log.push(`end:${progress}`));

    p.notifyScrolled(150); // active
    p.notifyScrolled(300); // exit at endY — after (progress=1)

    expect(log[log.length - 1]).toMatch(/^end:1$/);
    // Last scroll event comes before end.
    const endIdx = log.lastIndexOf(log.find((e) => e.startsWith("end:"))!);
    const lastScrollIdx = log.lastIndexOf(
      log.filter((e) => e.startsWith("scroll:")).at(-1)!,
    );
    expect(lastScrollIdx).toBeLessThan(endIdx);
  });

  it("emits reverseStart and reverseEnd when scrolling up through trigger", () => {
    const { p, trigger } = makePresentation();
    const log: string[] = [];

    trigger.on("reverseStart", () => log.push("reverseStart"));
    trigger.on("scroll", () => log.push("scroll"));
    trigger.on("reverseEnd", () => log.push("reverseEnd"));

    // Start past the trigger (after state)
    p.notifyScrolled(400);
    // Enter from below (scrolling up)
    p.notifyScrolled(200);
    // Exit at top (scrolling up)
    p.notifyScrolled(50);

    expect(log).toContain("reverseStart");
    expect(log).toContain("reverseEnd");
    const rsIdx = log.indexOf("reverseStart");
    const reIdx = log.indexOf("reverseEnd");
    // scroll events appear between reverseStart and reverseEnd
    const scrollIdx = log.indexOf("scroll");
    expect(scrollIdx).toBeGreaterThan(rsIdx);
    expect(reIdx).toBeGreaterThan(scrollIdx);
  });

  it("no events when jumping over the trigger entirely", () => {
    const { p, trigger } = makePresentation();
    const fired: string[] = [];

    trigger.on("start", () => fired.push("start"));
    trigger.on("scroll", () => fired.push("scroll"));
    trigger.on("end", () => fired.push("end"));
    trigger.on("reverseStart", () => fired.push("reverseStart"));
    trigger.on("reverseEnd", () => fired.push("reverseEnd"));

    p.notifyScrolled(50); // before
    p.notifyScrolled(400); // jumped past trigger without entering

    expect(fired).toHaveLength(0);
  });

  it("entering exactly at startY triggers start (progress=0)", () => {
    const { p, trigger } = makePresentation();
    const progresses: number[] = [];

    trigger.on("start", ({ progress }) => progresses.push(progress));

    p.notifyScrolled(99); // just before
    p.notifyScrolled(100); // exactly at startY

    expect(progresses).toHaveLength(1);
    expect(progresses[0]).toBe(0);
  });

  it("reaching exactly endY triggers end (progress=1)", () => {
    const { p, trigger } = makePresentation();
    const progresses: number[] = [];

    trigger.on("end", ({ progress }) => progresses.push(progress));

    p.notifyScrolled(150); // active
    p.notifyScrolled(300); // exactly at endY

    expect(progresses).toHaveLength(1);
    expect(progresses[0]).toBe(1);
  });

  it("progress is normalised 0–1 within the range", () => {
    const { p, trigger } = makePresentation();
    const progresses: number[] = [];

    trigger.on("scroll", ({ progress }) => progresses.push(progress));

    p.notifyScrolled(100); // enter (start fires, scroll at 0)
    p.notifyScrolled(200); // midpoint
    p.notifyScrolled(299); // near end

    expect(progresses[0]).toBe(0);
    expect(progresses[1]).toBe(0.5);
    expect(progresses[2]).toBeCloseTo(0.995);
  });

  it("multiple triggers are all driven by notifyScrolled", () => {
    const p = makeP();
    const t1 = p.addScrollTrigger({ top: constant(0), height: constant(100) });
    const t2 = p.addScrollTrigger({
      top: constant(200),
      height: constant(100),
    });

    const log: string[] = [];
    t1.on("start", () => log.push("t1:start"));
    t2.on("start", () => log.push("t2:start"));

    p.notifyScrolled(0); // enters t1
    p.notifyScrolled(200); // exits t1, enters t2

    expect(log).toContain("t1:start");
    expect(log).toContain("t2:start");
  });
});
