import {
  PresentationBuilder,
  compilePresentation,
  ContentDependentDimension,
  HTMLPresentationView,
} from "@rippledoc/presentation2";

const pb = new PresentationBuilder();

pb.setBasisDimensions(640, 480);

const s1 = pb.addSection();
s1.yAxis.set("sectionTop", "0");
s1.yAxis.set("sectionHeight", "100");

const e1 = s1.addElement();
e1.name = "Element1";
e1.xAxis.set("left", "10");
e1.xAxis.set("width", "content*2");
e1.yAxis.set("top", "elements.Element2.bottom");
e1.yAxis.set("height", "100");

const e2 = s1.addElement();
e2.name = "Element2";
e2.xAxis.set("left", "10");
e2.xAxis.set("width", "10");
e2.yAxis.set("top", "10");
e2.yAxis.set("height", "10");

try {
  const p = await compilePresentation(pb);

  const e = p.sections[0]!.elements[0]!;

  console.log(`Left: ${e.left}, Width: ${e.width}, Right: ${e.right}`);
  console.log(`Top: ${e.top}, Height: ${e.height}, Bottom: ${e.bottom}`);

  console.log(`Content-dependent dimension: ${e.contentDependentDimension}`);

  const htmlView = new HTMLPresentationView({ presentation: p });
  console.log(htmlView);
} catch (e) {
  console.error("Compilation error:", e);
}
