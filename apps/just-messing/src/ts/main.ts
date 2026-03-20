import {
  PresentationBuilder,
  compilePresentation,
} from "@rippledoc/presentation2";

const pb = new PresentationBuilder();

pb.setBasisDimensions(640, 480);

const s1 = pb.addSection();
s1.yAxis.set("sectionTop", "0");
s1.yAxis.set("sectionHeight", "100");

const e1 = s1.addElement();
e1.xAxis.set("left", "0");
e1.xAxis.set("width", "100");
e1.yAxis.set("top", "0");
e1.yAxis.set("height", "100");

const presentation = compilePresentation(pb);
presentation.then((p) => {
  console.log(p);
});
