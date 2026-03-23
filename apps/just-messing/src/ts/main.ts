import "../css/styles.css";

import {
  PresentationBuilder,
  compilePresentation,
  ScrollTriggerBuilder,
  HTMLPresentationView,
} from "@rippledoc/presentation2";

const pb = new PresentationBuilder();

pb.setBasisDimensions(640, 480);

const s1 = pb.addSection();
s1.sectionHeight = "slideHeight";

const s2 = pb.addSection();
s2.name = "Section 2";
s2.sectionHeight = "800";

const e1 = s1.addElement();
e1.name = "Element1";
e1.xAxis.set("left", "10");
e1.xAxis.set("right", "basisWidth-10");
e1.yAxis.set("top", "10");
e1.yAxis.set("height", "100");

const e2 = s1.addElement();
e2.name = "Element2";
e2.xAxis.set("left", "10");
e2.xAxis.set("right", "basisWidth-10");
e2.yAxis.set("top", "elements.Element1.bottom+10");
e2.yAxis.set("bottom", "sectionBottom-10");

const st1 = e2.addScrollTrigger();
st1.name = "ScrollTrigger1";
st1.start = "top";
st1.end = "bottom";

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

  const e = p.sections[0]!.elements[1]!;
  const st = e.scrollTriggers[0]!;

  st.on("start", () => console.log("ScrollTrigger1 started"));
  st.on("reverseStart", () => console.log("ScrollTrigger1 reverse started"));
  st.on("end", () => console.log("ScrollTrigger1 ended"));
  st.on("reverseEnd", () => console.log("ScrollTrigger1 reverse ended"));

  const htmlView = new HTMLPresentationView({
    presentation: p,
    container: "#theContainer",
  });
  console.log(htmlView);
} catch (e) {
  console.error("Compilation error:", e);
}
