import { describe, expect, it } from "vitest";
import * as p3 from "../../index";

describe("presentation3 layout model", () => {
  it("should copy element positions and sizes to new layout", () => {
    const p = p3.createPresentation({
      basisWidth: 400,
      basisHeight: 400,
    });

    const s1 = p.addSection();

    const e1 = s1.addMarkdownElement("# Test");
    e1.setHorizontalAnchors({ left: p3.constant(50), width: p3.constant(100) });
    e1.setVerticalAnchors({ top: p3.constant(50), height: p3.constant(100) });

    // All current sections and elements should create new anchor sets and these should be copied
    // from the old layout.
    const l2 = p.addLayout({
      basisWidth: 200,
      basisHeight: 200,
    });

    p.setActiveLayout(l2);

    expect(e1.left).toBe(50);
    expect(e1.top).toBe(50);
    expect(e1.width).toBe(100);
    expect(e1.height).toBe(100);
  });

  it("should preserve element positions and sizes when switching layouts", () => {
    const p = p3.createPresentation({
      basisWidth: 400,
      basisHeight: 400,
    });

    const s1 = p.addSection();

    const e1 = s1.addMarkdownElement("# Test");
    e1.setHorizontalAnchors({ left: p3.constant(50), width: p3.constant(100) });
    e1.setVerticalAnchors({ top: p3.constant(50), height: p3.constant(100) });

    // All current sections and elements should create new anchor sets and these should be copied
    // from the old layout.
    const l2 = p.addLayout({
      basisWidth: 200,
      basisHeight: 200,
    });

    p.setActiveLayout(l2);
    e1.setHorizontalAnchors({
      left: p3.constant(150),
      width: p3.constant(200),
    });
    e1.setVerticalAnchors({ top: p3.constant(150), height: p3.constant(200) });

    p.setActiveLayout(p.defaultLayout);

    expect(e1.left).toBe(50);
    expect(e1.top).toBe(50);
    expect(e1.width).toBe(100);
    expect(e1.height).toBe(100);
  });
});
