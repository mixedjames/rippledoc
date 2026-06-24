/**
 * Tests for the presentation4 animation model.
 *
 * Covers: KeyFrameAnimation properties and mutation, element animations (keyframe
 * + pin), section animations, and all corresponding event emissions.
 */

import { describe, it, expect, vi } from "vitest";
import { CorePresentation } from "../CorePresentation";
import { constant } from "../../anchors/factories";
import type { KeyFrame } from "../../clientAPI/animation/KeyFrame";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePresentation() {
  const p = new CorePresentation({ basisWidth: 1000, basisHeight: 800 });
  const trigger = p.addScrollTrigger({ top: constant(0), height: constant(200) });
  const section = p.root.addSection();
  section.setVerticalAnchors({ top: constant(0), height: constant(800) });
  const element = section.addMarkdownElement("hello");
  element.setHorizontalAnchors({ left: constant(0), width: constant(400) });
  element.setVerticalAnchors({ top: constant(0), height: constant(50) });
  return { p, trigger, section, element };
}

const FRAMES: readonly KeyFrame[] = [
  { position: 0, opacity: 0 },
  { position: 500, opacity: 1 },
];

// ── KeyFrameAnimation — construction ─────────────────────────────────────────

describe("KeyFrameAnimation — construction", () => {
  it("exposes trigger, duration, and isScrollDriven", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
      scrollDriven: true,
    });

    expect(anim.trigger).toBe(trigger);
    expect(anim.duration).toBe(500);
    expect(anim.isScrollDriven).toBe(true);
  });

  it("defaults isScrollDriven to false when scrollDriven is omitted", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 300,
    });

    expect(anim.isScrollDriven).toBe(false);
  });

  it("exposes the supplied keyFrames", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
    });

    expect(anim.keyFrames).toEqual(FRAMES);
  });

  it("keyFrames is a copy — mutating the source array does not change it", () => {
    const { trigger, section } = makePresentation();
    const mutable: KeyFrame[] = [...FRAMES];
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: mutable,
      duration: 500,
    });
    mutable.push({ position: 1000, opacity: 0.5 });

    expect(anim.keyFrames).toHaveLength(2);
  });
});

// ── KeyFrameAnimation — sub-component targeting ───────────────────────────────

describe("KeyFrameAnimation — sub-component targeting", () => {
  it("hasTarget is false when no target is supplied", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
    });

    expect(anim.hasTarget).toBe(false);
  });

  it("target throws when hasTarget is false", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
    });

    expect(() => anim.target).toThrow();
  });

  it("hasTarget is true when a target is supplied", () => {
    const { p, trigger, section } = makePresentation();
    const svgEl = section.addSVGImageElement();
    const target = svgEl.subComponent("#my-path");
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
      target,
    });
    void p; // present to enable trigger resolution

    expect(anim.hasTarget).toBe(true);
  });

  it("target.selector matches the supplied selector", () => {
    const { trigger, section } = makePresentation();
    const svgEl = section.addSVGImageElement();
    const target = svgEl.subComponent("#my-path");
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
      target,
    });

    expect(anim.target.selector).toBe("#my-path");
  });
});

// ── KeyFrameAnimation — setKeyFrames ─────────────────────────────────────────

describe("KeyFrameAnimation — setKeyFrames", () => {
  it("replaces the keyFrames", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
    });
    const newFrames: readonly KeyFrame[] = [{ position: 0, opacity: 1 }];

    anim.setKeyFrames(newFrames);

    expect(anim.keyFrames).toEqual(newFrames);
  });

  it("emits animation:keyFramesChanged with the animation", () => {
    const { p, trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
    });
    const listener = vi.fn();
    p.events.on("animation:keyFramesChanged", listener);

    anim.setKeyFrames([{ position: 0, transform: "scale(2)" }]);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ animation: anim });
  });

  it("new keyFrames is a copy — mutating the source does not change stored frames", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 500,
    });
    const replacement: KeyFrame[] = [{ position: 0, opacity: 0.5 }];

    anim.setKeyFrames(replacement);
    replacement.push({ position: 500, opacity: 1 });

    expect(anim.keyFrames).toHaveLength(1);
  });
});

// ── ElementAnimations — keyframe animations ───────────────────────────────────

describe("ElementAnimations — addKeyFrameAnimation", () => {
  it("returns a KeyFrameAnimation with the correct trigger and duration", () => {
    const { trigger, element } = makePresentation();
    const anim = element.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 400,
    });

    expect(anim.trigger).toBe(trigger);
    expect(anim.duration).toBe(400);
  });

  it("appears in keyFrameAnimations after being added", () => {
    const { trigger, element } = makePresentation();
    const anim = element.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 400,
    });

    expect(element.animations.keyFrameAnimations).toContain(anim);
  });

  it("emits element:animationAdded with the element and animation", () => {
    const { p, trigger, element } = makePresentation();
    const listener = vi.fn();
    p.events.on("element:animationAdded", listener);

    const anim = element.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 400,
    });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ element, animation: anim });
  });

  it("multiple animations accumulate in keyFrameAnimations", () => {
    const { p, trigger, element } = makePresentation();
    const t2 = p.addScrollTrigger({ top: constant(300), height: constant(200) });

    const a1 = element.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 300,
    });
    const a2 = element.animations.addKeyFrameAnimation({
      trigger: t2,
      keyFrames: FRAMES,
      duration: 600,
    });

    expect(element.animations.keyFrameAnimations).toEqual([a1, a2]);
  });
});

// ── ElementAnimations — pins ──────────────────────────────────────────────────

describe("ElementAnimations — addPin", () => {
  it("returns a Pin with the given trigger", () => {
    const { trigger, element } = makePresentation();
    const pin = element.animations.addPin(trigger);

    expect(pin.trigger).toBe(trigger);
  });

  it("appears in pins after being added", () => {
    const { trigger, element } = makePresentation();
    const pin = element.animations.addPin(trigger);

    expect(element.animations.pins).toContain(pin);
  });

  it("emits element:pinAdded with the element and pin", () => {
    const { p, trigger, element } = makePresentation();
    const listener = vi.fn();
    p.events.on("element:pinAdded", listener);

    const pin = element.animations.addPin(trigger);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ element, pin });
  });

  it("multiple pins accumulate", () => {
    const { p, trigger, element } = makePresentation();
    const t2 = p.addScrollTrigger({ top: constant(300), height: constant(100) });

    const pin1 = element.animations.addPin(trigger);
    const pin2 = element.animations.addPin(t2);

    expect(element.animations.pins).toEqual([pin1, pin2]);
  });
});

// ── ElementAnimations — pins and keyframe animations coexist ──────────────────

describe("ElementAnimations — pins and animations coexist", () => {
  it("pins and keyFrameAnimations are independent collections", () => {
    const { trigger, element } = makePresentation();

    element.animations.addPin(trigger);
    element.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 300,
    });

    expect(element.animations.pins).toHaveLength(1);
    expect(element.animations.keyFrameAnimations).toHaveLength(1);
  });
});

// ── SectionAnimations — keyframe animations ───────────────────────────────────

describe("SectionAnimations — addKeyFrameAnimation", () => {
  it("returns a KeyFrameAnimation with the correct trigger and duration", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 600,
    });

    expect(anim.trigger).toBe(trigger);
    expect(anim.duration).toBe(600);
  });

  it("appears in keyFrameAnimations after being added", () => {
    const { trigger, section } = makePresentation();
    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 600,
    });

    expect(section.animations.keyFrameAnimations).toContain(anim);
  });

  it("emits section:animationAdded with the section and animation", () => {
    const { p, trigger, section } = makePresentation();
    const listener = vi.fn();
    p.events.on("section:animationAdded", listener);

    const anim = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 600,
    });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ section, animation: anim });
  });

  it("multiple animations accumulate in keyFrameAnimations", () => {
    const { p, trigger, section } = makePresentation();
    const t2 = p.addScrollTrigger({ top: constant(300), height: constant(200) });

    const a1 = section.animations.addKeyFrameAnimation({
      trigger,
      keyFrames: FRAMES,
      duration: 300,
    });
    const a2 = section.animations.addKeyFrameAnimation({
      trigger: t2,
      keyFrames: FRAMES,
      duration: 600,
    });

    expect(section.animations.keyFrameAnimations).toEqual([a1, a2]);
  });
});
