import "../css/styles.css";
import { parseMarkdown } from "@rippledoc/markdown";

import {
  PresentationBuilder,
  compilePresentation,
  HTMLPresentationView,
} from "@rippledoc/presentation2";

const pb = new PresentationBuilder();

pb.setBasisDimensions(640, 480);

const s1 = pb.addSection();
s1.sectionHeight = "slideHeight/2";

const s2 = pb.addSection();
s2.name = "Section 2";
s2.sectionHeight = "slideHeight";

const s3 = pb.addSection();
s3.name = "Section 3";
s3.sectionHeight = "slideHeight";

const e1 = s1.addElement();
e1.name = "Element1";
e1.xAxis.set("left", "10");
e1.xAxis.set("right", "basisWidth-10");
e1.yAxis.set("top", "10");
e1.yAxis.set("height", "100");

const e2 = s1.addTextBox();
e2.name = "Element2";
e2.xAxis.set("left", "10");
e2.xAxis.set("width", "basisWidth-20");
e2.yAxis.set("top", "elements.Element1.bottom+10");
e2.yAxis.set("height", "content");

const fragment = parseMarkdown(
  "# Hello, world!\n\nThis is a paragraph with some slightly longer text.\n" +
    "- And a list item\n- And another one\n\nAnd some more text at the end.",
);
e2.htmlContent = fragment;

const e5 = s1.addImageElement();
e5.name = "Element5";
e5.xAxis.set("left", "20");
e5.xAxis.set("width", "50");
e5.yAxis.set("bottom", "sectionBottom-20");
e5.yAxis.set("height", "content");
e5.source = "img/test.svg";

const p1 = e5.addPin();
p1.scrollTrigger = "ScrollTrigger1";

const st1 = e5.addScrollTrigger();
st1.name = "ScrollTrigger1";
st1.start = "top";
st1.end = "start + slideHeight";

const e4 = s2.addElement();
e4.xAxis.set("left", "10");
e4.xAxis.set("right", "basisWidth-10");
e4.yAxis.set("top", "sectionTop+10");
e4.yAxis.set("bottom", "sectionBottom-10");

const e3 = s2.addElement();
e3.xAxis.set("left", "basisWidth/2 - width/2");
e3.xAxis.set("width", "basisWidth*0.5");
e3.yAxis.set("top", "sectionTop+sectionHeight/2-height/2");
e3.yAxis.set("height", "100");

try {
  const p = await compilePresentation(pb);

  const htmlView = new HTMLPresentationView({
    presentation: p,
    container: "#theContainer",
  });
  console.log(htmlView);
} catch (e) {
  console.error("Compilation error:", e);
}
