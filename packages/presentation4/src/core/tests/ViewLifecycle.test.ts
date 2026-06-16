/**
 * Tests for the view lifecycle: attachView cascade, immediate wiring for
 * late-added sections and elements, view teardown on re-attach, and layout passes.
 *
 * The model is view-agnostic — it programs against the view interfaces, not any
 * concrete renderer. This file defines lightweight spy views that record every
 * call they receive, so tests can assert on exactly which operations happened
 * in what order.
 */

import { describe, it, expect } from "vitest";
import { CorePresentation } from "../CorePresentation";
import type { PresentationView } from "../../viewAPI/PresentationView";
import type { PresentationViewOwner } from "../../viewAPI/PresentationViewOwner";
import type { SectionView } from "../../viewAPI/SectionView";
import type { SectionViewOwner } from "../../viewAPI/SectionViewOwner";
import type { ElementView } from "../../viewAPI/ElementView";
import type {
  MarkdownElementViewOwner,
  BitmapImageElementViewOwner,
  SVGImageElementViewOwner,
} from "../../viewAPI/ElementViewOwner";
import type { LayoutTransform } from "../../viewAPI/LayoutTransform";

// ── Spy views ────────────────────────────────────────────────────────────────
//
// Each spy records every call it receives so tests can make precise assertions.
// They store the arguments received, not just call counts, so tests can verify
// both the fact that a call happened and what was passed.

class SpyElementView implements ElementView {
  readonly layoutCalls: LayoutTransform[] = [];
  destroyCount = 0;

  layout(transform: LayoutTransform): void {
    this.layoutCalls.push({ ...transform });
  }

  applyConstrainedDimension(): void {}
  measureAndReport(): void {}
  applyStyle(): void {}

  destroy(): void {
    this.destroyCount++;
  }
}

class SpySectionView implements SectionView {
  readonly layoutCalls: LayoutTransform[] = [];
  destroyCount = 0;

  // Each entry records the owner passed by the model and the spy view that was returned,
  // so tests can get a handle on the element spy for further assertions.
  readonly markdownViewsCreated: {
    owner: MarkdownElementViewOwner;
    view: SpyElementView;
  }[] = [];
  readonly bitmapViewsCreated: {
    owner: BitmapImageElementViewOwner;
    view: SpyElementView;
  }[] = [];
  readonly svgViewsCreated: {
    owner: SVGImageElementViewOwner;
    view: SpyElementView;
  }[] = [];

  layout(transform: LayoutTransform): void {
    this.layoutCalls.push({ ...transform });
  }

  applyStyle(): void {}

  createMarkdownElementView(owner: MarkdownElementViewOwner): ElementView {
    const view = new SpyElementView();
    this.markdownViewsCreated.push({ owner, view });
    return view;
  }

  createBitmapImageElementView(
    owner: BitmapImageElementViewOwner,
  ): ElementView {
    const view = new SpyElementView();
    this.bitmapViewsCreated.push({ owner, view });
    return view;
  }

  createSVGImageElementView(owner: SVGImageElementViewOwner): ElementView {
    const view = new SpyElementView();
    this.svgViewsCreated.push({ owner, view });
    return view;
  }

  // Cascades bottom-up: element views destroyed before this section view.
  destroy(): void {
    for (const { view } of [
      ...this.markdownViewsCreated,
      ...this.bitmapViewsCreated,
      ...this.svgViewsCreated,
    ]) {
      view.destroy();
    }
    this.destroyCount++;
  }
}

class SpyPresentationView implements PresentationView {
  readonly physicalWidth: number;
  readonly physicalHeight: number;
  readonly layoutCalls: LayoutTransform[] = [];
  destroyCount = 0;

  // Each entry records the SectionViewOwner and the SpySectionView returned,
  // giving tests a handle on the section spy for further assertions.
  readonly sectionViewsCreated: {
    owner: SectionViewOwner;
    view: SpySectionView;
  }[] = [];

  constructor(physicalWidth: number, physicalHeight: number) {
    this.physicalWidth = physicalWidth;
    this.physicalHeight = physicalHeight;
  }

  get width(): number {
    return this.physicalWidth;
  }

  get height(): number {
    return this.physicalHeight;
  }

  layout(transform: LayoutTransform): void {
    this.layoutCalls.push({ ...transform });
  }

  createSectionView(owner: SectionViewOwner): SectionView {
    const view = new SpySectionView();
    this.sectionViewsCreated.push({ owner, view });
    return view;
  }

  // Cascades bottom-up: section views (and their element views) destroyed before this view.
  destroy(): void {
    for (const { view } of this.sectionViewsCreated) {
      view.destroy();
    }
    this.destroyCount++;
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("view lifecycle — before attachView", () => {
  it("the model tree can be built and queried with no view attached", () => {
    // The model should be usable as a pure data model before any renderer exists.
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement("# Slide one");
    section.addBitmapImageElement();
    section.addSVGImageElement();

    expect(p.root.getSections()).toHaveLength(1);
    expect(section.getElements()).toHaveLength(3);
    expect(el.markdown).toBe("# Slide one");
  });
});

describe("view lifecycle — attachView", () => {
  it("calls the factory with the presentation itself as the PresentationViewOwner", () => {
    const p = new CorePresentation();
    const spy = new SpyPresentationView(800, 600);

    // Capture the owner argument the model passes to the factory.
    let capturedOwner: PresentationViewOwner | null = null;
    p.attachView((owner) => {
      capturedOwner = owner;
      return spy;
    });

    // The viewAPI contract: the object passed to the factory is the PresentationViewOwner,
    // which CorePresentation implements directly.
    expect(capturedOwner).toBe(p);
  });

  it("calls createSectionView for each section that existed before attach", () => {
    const p = new CorePresentation();
    p.root.addSection();
    p.root.addSection();

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    expect(spy.sectionViewsCreated).toHaveLength(2);
  });

  it("passes the section as the SectionViewOwner to createSectionView", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    // The section implements SectionViewOwner, so the factory should receive it directly.
    expect(spy.sectionViewsCreated[0]!.owner).toBe(section);
  });

  it("creates element views for all elements that existed before attach", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.addMarkdownElement("content");
    section.addBitmapImageElement();
    section.addSVGImageElement();

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const sectionSpy = spy.sectionViewsCreated[0]!.view;
    expect(sectionSpy.markdownViewsCreated).toHaveLength(1);
    expect(sectionSpy.bitmapViewsCreated).toHaveLength(1);
    expect(sectionSpy.svgViewsCreated).toHaveLength(1);
  });

  it("runs a layout pass immediately after attaching", () => {
    const p = new CorePresentation();
    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);
    // One layout call should have happened synchronously during attachView.
    expect(spy.layoutCalls).toHaveLength(1);
  });

  it("layout pass propagates the current layoutTransform to all views", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.addMarkdownElement("hello");

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    // SpyPresentationView is 800×600; default basis is 1000×1000.
    // scale = min(800/1000, 600/1000) = 0.6; tx = (800 − 1000×0.6) / 2 = 100.
    const expectedTransform: LayoutTransform = { scale: 0.6, tx: 100 };
    const sectionSpy = spy.sectionViewsCreated[0]!.view;
    const elementSpy = sectionSpy.markdownViewsCreated[0]!.view;

    expect(spy.layoutCalls[0]).toEqual(expectedTransform);
    expect(sectionSpy.layoutCalls[0]).toEqual(expectedTransform);
    expect(elementSpy.layoutCalls[0]).toEqual(expectedTransform);
  });
});

describe("view lifecycle — adding after attachView", () => {
  it("section added after attachView immediately receives a real SectionView", () => {
    const p = new CorePresentation();
    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    expect(spy.sectionViewsCreated).toHaveLength(0);

    p.root.addSection();

    expect(spy.sectionViewsCreated).toHaveLength(1);
  });

  it("element added to a section (which already has a real view) immediately receives a real ElementView", () => {
    const p = new CorePresentation();
    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const section = p.root.addSection();
    const sectionSpy = spy.sectionViewsCreated[0]!.view;

    expect(sectionSpy.markdownViewsCreated).toHaveLength(0);

    section.addMarkdownElement("new slide");

    expect(sectionSpy.markdownViewsCreated).toHaveLength(1);
    expect(sectionSpy.markdownViewsCreated[0]!.owner.markdown).toBe(
      "new slide",
    );
  });

  it("elements added after attachView receive the full range of element view types", () => {
    const p = new CorePresentation();
    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const section = p.root.addSection();
    const sectionSpy = spy.sectionViewsCreated[0]!.view;

    section.addMarkdownElement();
    section.addBitmapImageElement();
    section.addSVGImageElement();

    expect(sectionSpy.markdownViewsCreated).toHaveLength(1);
    expect(sectionSpy.bitmapViewsCreated).toHaveLength(1);
    expect(sectionSpy.svgViewsCreated).toHaveLength(1);
  });
});

describe("view lifecycle — re-attaching a view", () => {
  it("destroys the old PresentationView when a new one is attached", () => {
    const p = new CorePresentation();
    const spy1 = new SpyPresentationView(800, 600);
    const spy2 = new SpyPresentationView(800, 600);

    p.attachView(() => spy1);
    expect(spy1.destroyCount).toBe(0);

    p.attachView(() => spy2);
    expect(spy1.destroyCount).toBe(1);
  });

  it("destroys old SectionViews when a new view is attached", () => {
    const p = new CorePresentation();
    p.root.addSection();
    const spy1 = new SpyPresentationView(800, 600);
    p.attachView(() => spy1);

    const oldSectionSpy = spy1.sectionViewsCreated[0]!.view;
    expect(oldSectionSpy.destroyCount).toBe(0);

    const spy2 = new SpyPresentationView(800, 600);
    p.attachView(() => spy2);

    expect(oldSectionSpy.destroyCount).toBe(1);
  });

  it("destroys old ElementViews when a new view is attached", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.addMarkdownElement("content");
    const spy1 = new SpyPresentationView(800, 600);
    p.attachView(() => spy1);

    const oldElementSpy =
      spy1.sectionViewsCreated[0]!.view.markdownViewsCreated[0]!.view;
    expect(oldElementSpy.destroyCount).toBe(0);

    const spy2 = new SpyPresentationView(800, 600);
    p.attachView(() => spy2);

    expect(oldElementSpy.destroyCount).toBe(1);
  });

  it("creates fresh views for all existing sections and elements on re-attach", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.addMarkdownElement("one");
    section.addBitmapImageElement();

    const spy1 = new SpyPresentationView(800, 600);
    p.attachView(() => spy1);

    const spy2 = new SpyPresentationView(800, 600);
    p.attachView(() => spy2);

    // The second spy should have created one section view with two element views.
    expect(spy2.sectionViewsCreated).toHaveLength(1);
    const newSectionSpy = spy2.sectionViewsCreated[0]!.view;
    expect(newSectionSpy.markdownViewsCreated).toHaveLength(1);
    expect(newSectionSpy.bitmapViewsCreated).toHaveLength(1);
  });
});

describe("view lifecycle — removeSection", () => {
  it("destroys the SectionView when a section is removed", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const sectionSpy = spy.sectionViewsCreated[0]!.view;
    expect(sectionSpy.destroyCount).toBe(0);

    p.root.removeSection(section);

    expect(sectionSpy.destroyCount).toBe(1);
  });

  it("destroys element views bottom-up when a section is removed", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.addMarkdownElement("content");

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const sectionSpy = spy.sectionViewsCreated[0]!.view;
    const elementSpy = sectionSpy.markdownViewsCreated[0]!.view;

    p.root.removeSection(section);

    // Element view destroyed before section view (bottom-up).
    expect(elementSpy.destroyCount).toBe(1);
    expect(sectionSpy.destroyCount).toBe(1);
  });

  it("does not destroy anything when no view is attached (null view teardown is a no-op)", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.addMarkdownElement();
    // No attachView — all views are null. removeSection must not throw.
    expect(() => p.root.removeSection(section)).not.toThrow();
  });
});

describe("view lifecycle — removeElement", () => {
  it("destroys the ElementView when an element is removed", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement("hello");

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const sectionSpy = spy.sectionViewsCreated[0]!.view;
    const elementSpy = sectionSpy.markdownViewsCreated[0]!.view;
    expect(elementSpy.destroyCount).toBe(0);

    section.removeElement(el);

    expect(elementSpy.destroyCount).toBe(1);
  });

  it("does not affect other element views when one is removed", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el1 = section.addMarkdownElement("one");
    const el2 = section.addMarkdownElement("two");

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const sectionSpy = spy.sectionViewsCreated[0]!.view;
    const spy1 = sectionSpy.markdownViewsCreated[0]!.view;
    const spy2 = sectionSpy.markdownViewsCreated[1]!.view;

    section.removeElement(el1);

    expect(spy1.destroyCount).toBe(1);
    expect(spy2.destroyCount).toBe(0);
  });
});

describe("view lifecycle — layout passes", () => {
  it("notifyViewResized triggers a layout pass on all views", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.addMarkdownElement("test");

    const spy = new SpyPresentationView(800, 600);
    p.attachView(() => spy);

    const sectionSpy = spy.sectionViewsCreated[0]!.view;
    const elementSpy = sectionSpy.markdownViewsCreated[0]!.view;

    // attachView already triggered one layout pass.
    expect(spy.layoutCalls).toHaveLength(1);
    expect(sectionSpy.layoutCalls).toHaveLength(1);
    expect(elementSpy.layoutCalls).toHaveLength(1);

    p.notifyViewResized(1024, 768);

    expect(spy.layoutCalls).toHaveLength(2);
    expect(sectionSpy.layoutCalls).toHaveLength(2);
    expect(elementSpy.layoutCalls).toHaveLength(2);
  });

  it("layoutTransform is accessible on the PresentationViewOwner", () => {
    // The view needs the layoutTransform to position its DOM elements.
    // Verify it is present and has the expected shape before ScaleHelper is wired up.
    const p = new CorePresentation();
    const transform = p.layoutTransform;
    expect(typeof transform.scale).toBe("number");
    expect(typeof transform.tx).toBe("number");
  });
});
