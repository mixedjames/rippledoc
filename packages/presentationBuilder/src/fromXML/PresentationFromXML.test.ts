import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { presentationFromXML } from "./PresentationFromXML";
import {
  nullViewFactory,
  Element,
  ImageElement,
  ImageFit,
  HTMLFragmentElement,
  ScrollTrigger,
} from "@rippledoc/presentation";

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

  it("parses optional alt and fit attributes for <image>", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section name="images" h="slideHeight">
    <image
      name="hero"
      source="images/hero.svg"
      fit="cover"
      alt="Hero illustration"
      l="0" w="slideWidth"
      t="sectionTop" h="slideHeight"
    />
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      viewFactory: nullViewFactory,
      text: xml,
    });

    expect(presentation.sections).toHaveLength(1);
    const section = presentation.sections[0]!;
    expect(section.elements).toHaveLength(1);

    const image = section.elements[0] as ImageElement;
    expect(image).toBeInstanceOf(ImageElement);
    expect(image.source).toBe("images/hero.svg");
    expect(image.fit).toBe(ImageFit.Cover);
    expect(image.altText).toBe("Hero illustration");
  });

  it("parses <fill> color and image into section style", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <fill
      image="url-to-image"
      color="#00FF00"
    />
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      viewFactory: nullViewFactory,
      text: xml,
    });

    expect(presentation.sections).toHaveLength(1);
    const section = presentation.sections[0]!;

    // image attribute
    expect(section.style.fill.imageSource).toBe("url-to-image");

    // color attribute (#00FF00 -> r=0, g=255, b=0, a=255)
    const color = section.style.fill.color;
    expect(color.r).toBe(0);
    expect(color.g).toBe(255);
    expect(color.b).toBe(0);
    expect(color.a).toBe(255);
  });

  it("parses <fill> color and image into element style", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <element l="10" w="slideWidth-20" t="sectionTop+10" h="slideHeight-20">
      <fill
        image="url-to-image"
        color="#00FF00"
      />
    </element>
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      viewFactory: nullViewFactory,
      text: xml,
    });

    expect(presentation.sections).toHaveLength(1);
    const section = presentation.sections[0]!;
    expect(section.elements).toHaveLength(1);

    const element = section.elements[0] as Element;

    // image attribute
    expect(element.style.fill.imageSource).toBe("url-to-image");

    // color attribute (#00FF00 -> r=0, g=255, b=0, a=255)
    const color = element.style.fill.color;
    expect(color.r).toBe(0);
    expect(color.g).toBe(255);
    expect(color.b).toBe(0);
    expect(color.a).toBe(255);
  });

  it("throws when <image> has an invalid fit value", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <image
      source="images/foo.png"
      fit="invalid-fit"
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
    ).rejects.toThrow(/invalid 'fit' value/);
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

  it("creates HTMLFragmentElement instances from <textbox> nodes and sanitises HTML", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section name="text" h="slideHeight">
    <textbox
      name="box1"
      l="10" w="100"
      t="sectionTop" h="50"
    >
      <span>Hello <strong>world</strong></span>
      <script>window.__xss__ = true;</script>
    </textbox>
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      viewFactory: nullViewFactory,
      text: xml,
    });

    expect(presentation.sections).toHaveLength(1);
    const section = presentation.sections[0]!;
    expect(section.elements).toHaveLength(1);

    const element = section.elements[0]!;
    expect(element).toBeInstanceOf(HTMLFragmentElement);

    const fragmentElement = element as HTMLFragmentElement;

    const clone = fragmentElement.fragment.cloneNode(true) as DocumentFragment;
    const container = document.createElement("div");
    container.appendChild(clone);

    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.textContent).toContain("Hello");

    const script = container.querySelector("script");
    expect(script).toBeNull();

    expect(element.left).toBe(10);
    expect(element.width).toBe(100);
  });

  it("parses section-level <scroll-trigger> elements", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <scroll-trigger
      name="t1"
      start="sectionTop"
      start-hits="top"
      end="sectionBottom"
      end-hits="bottom"
    />
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      viewFactory: nullViewFactory,
      text: xml,
    });

    expect(presentation.sections).toHaveLength(1);
    const section = presentation.sections[0]!;

    const triggers = section.scrollTriggers as ScrollTrigger[];
    expect(triggers.length).toBe(1);

    const trigger = triggers[0]!;

    // slideHeight expression evaluates to 600, but the default
    // viewport height is 480 and scale is 1, so:
    // viewportHeight = 480
    // sectionTop = 0
    // sectionBottom = 600
    // start = sectionTop - 0 * 480 = 0
    // end   = sectionBottom - 1 * 480 = 120
    expect(trigger.start).toBe(0);
    expect(trigger.end).toBe(120);
  });

  it("parses element-level <scroll-trigger> children when supported", async () => {
    const xml = `
<document>
  <slideSize w="800" h="600" />
  <section h="slideHeight">
    <element l="0" w="100" t="sectionTop" h="50">
      <scroll-trigger
        start="0"
        start-hits="50%"
        end="1000"
        end-hits="bottom"
      />
    </element>
  </section>
</document>
`;

    const presentation = await presentationFromXML({
      viewFactory: nullViewFactory,
      text: xml,
    });

    const section = presentation.sections[0]!;
    const element = section.elements[0] as Element;

    const triggers = element.scrollTriggers as ScrollTrigger[];
    expect(triggers.length).toBe(1);

    const trigger = triggers[0]!;

    // With default viewport height 480 and scale 1:
    // viewportHeight = 480
    // start = 0 - 0.5 * 480 = -240
    // end   = 1000 - 1 * 480 = 520
    expect(trigger.start).toBe(-240);
    expect(trigger.end).toBe(520);
  });
});
