import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { presentationFromXML } from "./PresentationFromXML";
import { nullViewFactory } from "../view/NullViewFactory";
import { Element } from "../Element";
import { ImageElement } from "../ImageElement";

const SAMPLE_XML = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight" b="">
    <element l="10" w="slideWidth-20" t="sectionTop+10" h="slideHeight-20" />
  </section>
</document>
`;

describe("presentationFromXML", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Mock fetch to return our sample XML.
    // We only rely on ok, statusText and text().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = vi.fn(async () => ({
      ok: true,
      statusText: "OK",
      text: async () => SAMPLE_XML,
    }));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch!;
  });

  it("builds a presentation from XML with correct slide size and structure", async () => {
    const presentation = await presentationFromXML({
      url: "http://example.test/presentation.xml",
      viewFactory: nullViewFactory,
    });

    expect(presentation.slideWidth).toBe(800);
    expect(presentation.slideHeight).toBe(600);
    expect(presentation.sections).toHaveLength(1);

    const section = presentation.sections[0]!;
    expect(section.elements).toHaveLength(1);

    const element = section.elements[0]!;
    // Basic sanity checks that expressions evaluate
    expect(typeof element.left).toBe("number");
    expect(typeof element.width).toBe("number");
  });

  it("throws when <slideSize> is missing", async () => {
    const BAD_XML = `<document></document>`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = vi.fn(async () => ({
      ok: true,
      statusText: "OK",
      text: async () => BAD_XML,
    }));

    await expect(
      presentationFromXML({
        url: "http://example.test/missing.xml",
        viewFactory: nullViewFactory,
      }),
    ).rejects.toThrow(/Missing required <slideSize> element/);
  });

  it("creates image elements from <image> nodes", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section name="main" h="slideHeight">
    <element
      name="text1"
      l="10" w="100"
      t="sectionTop" h="50"
    />
    <image
      name="img1"
      source="images/foo.png"
      l="20" w="200"
      t="sectionTop+10" h="100"
    />
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      viewFactory: nullViewFactory,
      text: xml,
    });

    expect(presentation.slideWidth).toBe(800);
    expect(presentation.slideHeight).toBe(600);

    expect(presentation.sections).toHaveLength(1);
    const section = presentation.sections[0]!;
    expect(section.name).toBe("main");

    expect(section.elements).toHaveLength(2);
    const [first, second] = section.elements;

    expect(first).toBeInstanceOf(Element);
    expect(second).toBeInstanceOf(ImageElement);

    const image = second as ImageElement;
    expect(image.source).toBe("images/foo.png");
  });

  it("throws when <image> is missing a source attribute", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <image
      l="0" w="100"
      t="sectionTop" h="50"
    />
  </section>
</document>
`;

    await expect(
      presentationFromXML({
        viewFactory: nullViewFactory,
        text: xml,
      }),
    ).rejects.toThrow(
      "<image> element must have a non-empty 'source' attribute",
    );
  });
});
