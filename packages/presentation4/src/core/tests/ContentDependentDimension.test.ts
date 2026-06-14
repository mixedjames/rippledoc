/**
 * Tests for content-dependent dimensions: setAutoHeight / setAutoWidth,
 * the measurement lifecycle (applyConstrainedDimension → measureAndReport →
 * notifyMeasuredSize), and the ordering guarantee (all writes before all reads).
 */

import { describe, it, expect } from "vitest";
import { CorePresentation } from "../CorePresentation";
import { constant, offsetFrom } from "../../anchors/factories";
import { GeometryConstraintError } from "../../anchors/GeometryConstraintError";
import type { ElementView } from "../../viewAPI/ElementView";
import type { ElementViewOwner } from "../../viewAPI/ElementViewOwner";
import type {
  MarkdownElementViewOwner,
  BitmapImageElementViewOwner,
  SVGImageElementViewOwner,
} from "../../viewAPI/ElementViewOwner";
import type { SectionView } from "../../viewAPI/SectionView";
import type { SectionViewOwner } from "../../viewAPI/SectionViewOwner";
import type {
  PresentationView,
  PresentationViewFactory,
} from "../../viewAPI/PresentationView";
import type { LayoutTransform } from "../../viewAPI/LayoutTransform";

// ── Spy infrastructure ────────────────────────────────────────────────────────

/**
 * An element view spy that records every call it receives.
 *
 * When `measureAndReport` is called it invokes `owner.notifyMeasuredSize` with
 * `simulatedMeasuredSize`, simulating a real DOM measurement. Setting
 * `simulatedMeasuredSize` to different values per-element lets tests verify that
 * the correct value ends up in the anchor system.
 *
 * An optional shared `callLog` string array can be passed to verify ordering
 * across multiple elements: this spy appends `"apply:<id>"` and `"measure:<id>"`
 * so the caller can assert all applies precede all measures.
 */
class MeasuringElementView implements ElementView {
  readonly applyConstrainedDimensionCalls: LayoutTransform[] = [];
  measureAndReportCount = 0;
  readonly layoutCalls: LayoutTransform[] = [];
  destroyCount = 0;
  simulatedMeasuredSize: number;

  constructor(
    private readonly owner: ElementViewOwner,
    simulatedMeasuredSize = 0,
    private readonly callLog: string[] = [],
    private readonly id: string = "",
  ) {
    this.simulatedMeasuredSize = simulatedMeasuredSize;
  }

  applyConstrainedDimension(transform: LayoutTransform): void {
    this.applyConstrainedDimensionCalls.push({ ...transform });
    if (this.id) this.callLog.push(`apply:${this.id}`);
  }

  measureAndReport(): void {
    this.measureAndReportCount++;
    if (this.id) this.callLog.push(`measure:${this.id}`);
    this.owner.notifyMeasuredSize(this.simulatedMeasuredSize);
  }

  layout(transform: LayoutTransform): void {
    this.layoutCalls.push({ ...transform });
  }

  destroy(): void {
    this.destroyCount++;
  }
}

/**
 * A section view that creates MeasuringElementView instances for markdown elements
 * and plain SpyElementViews for image elements.
 *
 * `measuringViews` gives tests direct access to the spy for each element created,
 * in creation order. `callLog` and `nextId` are threaded through so the ordering
 * test can see events from all elements in one array.
 */
class MeasuringSectionView implements SectionView {
  readonly layoutCalls: LayoutTransform[] = [];
  destroyCount = 0;
  readonly measuringViews: MeasuringElementView[] = [];

  constructor(
    private readonly callLog: string[] = [],
    private readonly simulatedSizes: number[] = [],
  ) {}

  layout(transform: LayoutTransform): void {
    this.layoutCalls.push({ ...transform });
  }

  createMarkdownElementView(owner: MarkdownElementViewOwner): ElementView {
    const idx = this.measuringViews.length;
    const size = this.simulatedSizes[idx] ?? 0;
    const view = new MeasuringElementView(
      owner,
      size,
      this.callLog,
      `el${idx}`,
    );
    this.measuringViews.push(view);
    return view;
  }

  createBitmapImageElementView(
    _owner: BitmapImageElementViewOwner,
  ): ElementView {
    return plainNoop();
  }

  createSVGImageElementView(_owner: SVGImageElementViewOwner): ElementView {
    return plainNoop();
  }

  destroy(): void {
    this.destroyCount++;
  }
}

function plainNoop(): ElementView {
  return {
    layout() {},
    applyConstrainedDimension() {},
    measureAndReport() {},
    destroy() {},
  };
}

function makePresentationView(
  sectionView: SectionView,
  physicalWidth = 1000,
  physicalHeight = 1000,
): PresentationViewFactory {
  return (_owner): PresentationView => ({
    get width() {
      return physicalWidth;
    },
    get height() {
      return physicalHeight;
    },
    layout() {},
    createSectionView(_sectionOwner: SectionViewOwner) {
      return sectionView;
    },
    destroy() {},
  });
}

// ── Model-level tests (no view required) ─────────────────────────────────────

describe("content-dependent dimensions — model API", () => {
  it("contentDependentDimension starts at 'none'", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    expect(el.contentDependentDimension).toBe("none");
  });

  it("setAutoHeight sets contentDependentDimension to 'height'", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: constant(10) });
    expect(el.contentDependentDimension).toBe("height");
  });

  it("setAutoWidth sets contentDependentDimension to 'width'", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setVerticalAnchors({ top: constant(0), height: constant(200) });
    el.setAutoWidth({ left: constant(10) });
    expect(el.contentDependentDimension).toBe("width");
  });

  describe("setAutoHeight — anchor values before measurement", () => {
    it("top is the provided expression; height starts at 0; bottom derives from top+height", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
      el.setAutoHeight({ top: constant(50) });

      expect(el.top).toBe(50);
      expect(el.height).toBe(0);
      expect(el.bottom).toBe(50); // 50 + 0
    });

    it("bottom is the provided expression; height starts at 0; top derives from bottom−height", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
      el.setAutoHeight({ bottom: constant(200) });

      expect(el.bottom).toBe(200);
      expect(el.height).toBe(0);
      expect(el.top).toBe(200); // 200 − 0
    });
  });

  describe("setAutoWidth — anchor values before measurement", () => {
    it("left is the provided expression; width starts at 0; right derives from left+width", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setVerticalAnchors({ top: constant(0), height: constant(100) });
      el.setAutoWidth({ left: constant(20) });

      expect(el.left).toBe(20);
      expect(el.width).toBe(0);
      expect(el.right).toBe(20); // 20 + 0
    });
  });

  describe("setVerticalAnchors clears auto height mode", () => {
    it("contentDependentDimension returns 'none' after setVerticalAnchors overrides setAutoHeight", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
      el.setAutoHeight({ top: constant(10) });
      expect(el.contentDependentDimension).toBe("height");

      el.setVerticalAnchors({ top: constant(10), height: constant(150) });
      expect(el.contentDependentDimension).toBe("none");
    });

    it("the overriding setVerticalAnchors anchors behave normally after clearing auto mode", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
      el.setAutoHeight({ top: constant(10) });
      el.setVerticalAnchors({ top: constant(10), height: constant(150) });

      expect(el.height).toBe(150);
      expect(el.bottom).toBe(160);
    });
  });

  describe("setHorizontalAnchors clears auto width mode", () => {
    it("contentDependentDimension returns 'none' after setHorizontalAnchors overrides setAutoWidth", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setVerticalAnchors({ top: constant(0), height: constant(100) });
      el.setAutoWidth({ left: constant(20) });
      expect(el.contentDependentDimension).toBe("width");

      el.setHorizontalAnchors({ left: constant(20), width: constant(300) });
      expect(el.contentDependentDimension).toBe("none");
    });
  });

  describe("fail-fast: both axes cannot be auto simultaneously", () => {
    it("setAutoHeight throws GeometryConstraintError when width is already auto", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setVerticalAnchors({ top: constant(0), height: constant(100) });
      el.setAutoWidth({ left: constant(0) });

      expect(() => el.setAutoHeight({ top: constant(0) })).toThrow(
        GeometryConstraintError,
      );
    });

    it("setAutoWidth throws GeometryConstraintError when height is already auto", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
      el.setAutoHeight({ top: constant(0) });

      expect(() => el.setAutoWidth({ left: constant(0) })).toThrow(
        GeometryConstraintError,
      );
    });

    it("does not change state when the throw occurs", () => {
      const p = new CorePresentation();
      const section = p.root.addSection();
      const el = section.addMarkdownElement();
      el.setVerticalAnchors({ top: constant(0), height: constant(100) });
      el.setAutoWidth({ left: constant(0) });

      try {
        el.setAutoHeight({ top: constant(0) });
      } catch {
        /* expected */
      }

      // Width auto mode must be intact after the failed setAutoHeight.
      expect(el.contentDependentDimension).toBe("width");
    });
  });

  it("setAutoHeight can be called a second time to update the position expression", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: constant(10) });
    el.setAutoHeight({ top: constant(30) });

    expect(el.contentDependentDimension).toBe("height");
    expect(el.top).toBe(30);
  });

  it("position expression can reference other anchors (e.g. offsetFrom section)", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    section.setVerticalAnchors({ top: constant(100), height: constant(400) });
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: offsetFrom(section.anchors.top, 20) });

    expect(el.top).toBe(120); // section.top (100) + 20
    expect(el.height).toBe(0);
    expect(el.bottom).toBe(120);
  });
});

// ── Measurement lifecycle tests (spy view) ────────────────────────────────────

describe("content-dependent dimensions — measurement lifecycle", () => {
  it("applyConstrainedDimension is not called for elements without auto dimensions", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setVerticalAnchors({ top: constant(0), height: constant(100) });

    const sectionSpy = new MeasuringSectionView();
    p.attachView(makePresentationView(sectionSpy));

    const elSpy = sectionSpy.measuringViews[0]!;
    // One layout pass from attachView; applyConstrainedDimension must not have been called.
    expect(elSpy.applyConstrainedDimensionCalls).toHaveLength(0);
  });

  it("applyConstrainedDimension and measureAndReport are called for auto-height elements", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: constant(0) });

    const sectionSpy = new MeasuringSectionView();
    p.attachView(makePresentationView(sectionSpy));

    const elSpy = sectionSpy.measuringViews[0]!;
    expect(elSpy.applyConstrainedDimensionCalls).toHaveLength(1);
    expect(elSpy.measureAndReportCount).toBe(1);

    // Subsequent layout passes repeat the measurement.
    p.notifyViewResized(1000, 1000);
    expect(elSpy.applyConstrainedDimensionCalls).toHaveLength(2);
    expect(elSpy.measureAndReportCount).toBe(2);
  });

  it("applyConstrainedDimension receives the current layout transform", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: constant(0) });

    const sectionSpy = new MeasuringSectionView();
    // 800×600 with 1000×1000 basis → scale=0.6, tx=100
    p.attachView(makePresentationView(sectionSpy, 800, 600));

    const elSpy = sectionSpy.measuringViews[0]!;
    expect(elSpy.applyConstrainedDimensionCalls[0]).toEqual({
      scale: 0.6,
      tx: 100,
    });
  });

  it("measureAndReport feeds the simulated size back via notifyMeasuredSize", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: constant(10) });

    const sectionSpy = new MeasuringSectionView([], [150]);
    p.attachView(makePresentationView(sectionSpy));

    // The spy reported 150; the model should have written it into the height anchor.
    expect(el.height).toBe(150);
    expect(el.bottom).toBe(160); // top(10) + height(150)
  });

  it("layout() is called with the measured height already populated", () => {
    // Verifies that the normal layout pass (which positions the element) happens
    // AFTER the measurement has been fed back — so the element's width/height in
    // the layout call already reflects the measured size, not zero.
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: constant(0) });

    const sectionSpy = new MeasuringSectionView([], [200]);
    p.attachView(makePresentationView(sectionSpy));

    // After layout, the anchor value must be 200.
    expect(el.height).toBe(200);
    // And layout() was called (once, from attachView).
    const elSpy = sectionSpy.measuringViews[0]!;
    expect(elSpy.layoutCalls).toHaveLength(1);
  });

  it("write-before-read: all applyConstrainedDimension calls precede all measureAndReport calls across elements", () => {
    // This is the anti-thrash guarantee: interleaving apply/measure per element
    // would cause one browser reflow per element; batching all writes then all
    // reads costs exactly one reflow regardless of how many elements there are.
    const p = new CorePresentation();
    const section = p.root.addSection();

    const el0 = section.addMarkdownElement();
    el0.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el0.setAutoHeight({ top: constant(0) });

    const el1 = section.addMarkdownElement();
    el1.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el1.setAutoHeight({ top: constant(50) });

    const callLog: string[] = [];
    const sectionSpy = new MeasuringSectionView(callLog, [100, 80]);
    p.attachView(makePresentationView(sectionSpy));

    // Expected ordering: apply:el0, apply:el1, measure:el0, measure:el1
    expect(callLog).toEqual([
      "apply:el0",
      "apply:el1",
      "measure:el0",
      "measure:el1",
    ]);
  });

  it("requestLayout re-runs the measurement and layout passes", () => {
    const p = new CorePresentation();
    const section = p.root.addSection();
    const el = section.addMarkdownElement();
    el.setHorizontalAnchors({ left: constant(0), width: constant(500) });
    el.setAutoHeight({ top: constant(0) });

    const sectionSpy = new MeasuringSectionView([], [100]);
    p.attachView(makePresentationView(sectionSpy));

    const elSpy = sectionSpy.measuringViews[0]!;
    expect(elSpy.applyConstrainedDimensionCalls).toHaveLength(1);

    // Simulate an async content load triggering a re-layout.
    p.requestLayout();
    expect(elSpy.applyConstrainedDimensionCalls).toHaveLength(2);
    expect(elSpy.measureAndReportCount).toBe(2);
    expect(elSpy.layoutCalls).toHaveLength(2);
  });
});
