import { describe, it, expect, afterEach } from "vitest";

import { presentationFromXML } from "@rippledoc/presentation";
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
    presentation.realiseView();
    presentation.layoutView();

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

    presentation.realiseView();
    presentation.layoutView();

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

  it("throws if layoutView is called before realiseView for HTML views", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const viewFactory = new HTMLViewFactory({ root });

    const presentation = await presentationFromXML({
      text: SAMPLE_XML,
      viewFactory,
    });

    // Presentation.layoutView() ultimately calls HTMLPresentationView.layout(), which
    // now enforces that realise() has already been called.
    expect(() => {
      presentation.layoutView();
    }).toThrow(/layout\(\) called before realise\(\)/i);
  });
});
