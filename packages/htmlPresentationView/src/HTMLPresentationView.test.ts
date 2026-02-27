import { describe, it, expect, afterEach, vi } from "vitest";
import * as Sanitizer from "@rippledoc/sanitizer";

import { presentationFromXML } from "@rippledoc/presentationBuilder";
import { HTMLViewFactory } from "./HTMLViewFactory";

const SAMPLE_XML = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight" b="">
    <element l="10" w="slideWidth-20" t="sectionTop+10" h="slideHeight-20" />
  </section>
</document>
`;

describe("HTMLPresentationView integration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("realises and lays out DOM structure for a simple presentation", async () => {
    const root = document.createElement("div");
    root.id = "test-root";
    document.body.appendChild(root);

    const viewFactory = new HTMLViewFactory({ root });

    const presentation = await presentationFromXML({
      text: SAMPLE_XML,
      viewFactory,
    });

    // Realise and lay out the full view tree.
    presentation.display.realise();
    presentation.display.layout();

    // Root structure
    const container = root.querySelector(
      ".presentation-root",
    ) as HTMLElement | null;
    expect(container).not.toBeNull();
    expect(container!.style.position).toBe("relative");

    const backgrounds = container!.querySelector(
      ".backgrounds",
    ) as HTMLElement | null;
    const elements = container!.querySelector(
      ".elements",
    ) as HTMLElement | null;
    expect(backgrounds).not.toBeNull();
    expect(elements).not.toBeNull();

    // We have exactly one section, so one background and one content section.
    expect(backgrounds!.children.length).toBe(1);
    expect(elements!.children.length).toBe(1);

    const backgroundDiv = backgrounds!.children[0] as HTMLDivElement;
    const sectionEl = elements!.children[0] as HTMLElement;

    // Section DOM nodes should be wired and positioned as per HTMLSectionView.
    expect(backgroundDiv.className).toMatch(/section-background$/);
    expect(backgroundDiv.style.position).toBe("absolute");
    expect(backgroundDiv.style.width).not.toBe("");
    expect(backgroundDiv.style.height).not.toBe("");

    expect(sectionEl.tagName.toLowerCase()).toBe("section");
    expect(sectionEl.className).toMatch(/section-content$/);
    expect(sectionEl.style.position).toBe("absolute");
    expect(sectionEl.style.left).toBe("0px");
    expect(sectionEl.style.top).toBe("0px");

    // The single element in the XML should be realised under the section.
    const elementDiv = sectionEl.querySelector("div") as HTMLDivElement | null;
    expect(elementDiv).not.toBeNull();
    expect(elementDiv!.className).toMatch(/element-.*-content/);
    expect(elementDiv!.style.position).toBe("absolute");
    expect(elementDiv!.style.width).not.toBe("");
    expect(elementDiv!.style.height).not.toBe("");
  });

  it("applies section fill style as background color and image", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const viewFactory = new HTMLViewFactory({ root });

    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <fill image="url-to-image" color="#00FF00" />
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      text: xml,
      viewFactory,
    });

    presentation.display.realise();
    presentation.display.layout();

    const container = root.querySelector(
      ".presentation-root",
    ) as HTMLElement | null;
    expect(container).not.toBeNull();

    const backgrounds = container!.querySelector(
      ".backgrounds",
    ) as HTMLElement | null;
    expect(backgrounds).not.toBeNull();
    expect(backgrounds!.children.length).toBe(1);

    const backgroundDiv = backgrounds!.children[0] as HTMLDivElement;

    // Background image should be derived from the <fill> image attribute.
    expect(backgroundDiv.style.backgroundImage).toContain("url-to-image");

    // Background color should reflect #00FF00 -> rgba(0, 255, 0, 1).
    expect(backgroundDiv.style.backgroundColor).toBe("rgba(0, 255, 0, 1)");
  });

  it("applies element fill style as background color and image", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const viewFactory = new HTMLViewFactory({ root });

    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <element l="10" w="slideWidth-20" t="sectionTop+10" h="slideHeight-20">
      <fill image="url-to-image" color="#00FF00" />
    </element>
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      text: xml,
      viewFactory,
    });

    presentation.display.realise();
    presentation.display.layout();

    const container = root.querySelector(
      ".presentation-root",
    ) as HTMLElement | null;
    expect(container).not.toBeNull();

    const elements = container!.querySelector(
      ".elements",
    ) as HTMLElement | null;
    expect(elements).not.toBeNull();
    expect(elements!.children.length).toBe(1);

    const sectionEl = elements!.children[0] as HTMLElement;
    const elementDiv = sectionEl.querySelector("div") as HTMLDivElement | null;
    expect(elementDiv).not.toBeNull();

    // Background image should be derived from the <fill> image attribute.
    expect(elementDiv!.style.backgroundImage).toContain("url-to-image");

    // Background color should reflect #00FF00 -> rgba(0, 255, 0, 1).
    expect(elementDiv!.style.backgroundColor).toBe("rgba(0, 255, 0, 1)");
  });

  it("throws if layoutView is called before realiseView for HTML views", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const viewFactory = new HTMLViewFactory({ root });

    const presentation = await presentationFromXML({
      text: SAMPLE_XML,
      viewFactory,
    });

    // presentation.display.layout() ultimately calls HTMLPresentationView.layout(), which
    // now enforces that realise() has already been called.
    expect(() => {
      presentation.display.layout();
    }).toThrow(/layout\(\) called before realise\(\)/i);
  });

  it("sanitises inline SVG images loaded from external sources", async () => {
    const originalFetch = globalThis.fetch;

    const sanitizeSpy = vi
      .spyOn(Sanitizer, "sanitizeSVG")
      .mockImplementation((dirty: string) =>
        dirty.replace(/<script[\s\S]*?<\/script>/, ""),
      );

    const MALICIOUS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <script>window.__xss__ = true;</script>
  <circle cx="5" cy="5" r="5" fill="red" />
</svg>
`;

    // Mock fetch to return a malicious SVG payload.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        statusText: "OK",
        text: () => Promise.resolve(MALICIOUS_SVG),
      }),
    );

    const root = document.createElement("div");
    document.body.appendChild(root);

    const viewFactory = new HTMLViewFactory({ root });

    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <image
      name="malicious"
      source="http://example.test/malicious.svg"
      l="0" w="100"
      t="sectionTop" h="50"
    />
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      text: xml,
      viewFactory,
    });

    presentation.display.realise();
    presentation.display.layout();

    // Allow queued tasks (fetch + sanitisation + DOM insertion) to run.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const svg = root.querySelector("svg") as SVGElement | null;
    expect(svg).not.toBeNull();

    // Ensure the sanitizer was invoked with the malicious SVG.
    expect(sanitizeSpy).toHaveBeenCalled();
    expect(sanitizeSpy.mock.calls[0]![0]).toContain("__xss__");

    // The malicious <script> should have been removed by sanitisation.
    expect(svg!.querySelector("script")).toBeNull();

    // Non-dangerous SVG content should remain.
    expect(svg!.querySelector("circle")).not.toBeNull();

    sanitizeSpy.mockRestore();
    globalThis.fetch = originalFetch!;
  });
});
