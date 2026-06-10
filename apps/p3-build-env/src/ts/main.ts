import * as p3 from "@rippledoc/presentation3";

const { constant, fractionOf, offsetFrom } = p3;

const p = p3.createPresentation({
  basisWidth: 400,
  basisHeight: 400,
});

const s1 = p.addSection();
s1.setVerticalAnchors({
  top: constant(0),
  height: offsetFrom(p.viewportHeightAnchor, 0),
});

const s2 = p.addSection();

p.replaceView(
  p3.createV1PresentationView({
    container: "#theContainer",
  }),
);

const e1 = s1.addElement();
e1.setVerticalAnchors({
  top: offsetFrom(s2.topAnchor, 10),
  height: constant(100),
});

console.log(p);
