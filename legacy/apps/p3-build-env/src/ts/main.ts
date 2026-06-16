import * as p3 from "@rippledoc/presentation3";

const { constant, fractionOf, offsetFrom } = p3;

const p = p3.createPresentation({
  basisWidth: 400,
  basisHeight: 400,
});

p.replaceView(
  p3.createV1PresentationView({
    container: "#theContainer",
  }),
);

const l2 = p.addLayout({
  basisWidth: 200,
  basisHeight: 200,
});

const s1 = p.addSection();
s1.setVerticalAnchors({
  top: constant(0),
  height: offsetFrom(p.viewportHeightAnchor, 0),
});

const e1 = s1.addMarkdownElement(
  "# Hello, world!\nThis is a markdown element.",
);
e1.setVerticalAnchors({
  top: offsetFrom(s1.topAnchor, 100),
  height: constant(100),
});

p.setActiveLayout(l2);

e1.setVerticalAnchors({
  top: offsetFrom(s1.topAnchor, 200),
  height: constant(100),
});

p.setLayoutPicker({
  pickLayout: (presentation: p3.Presentation): p3.Layout => {
    const { width, height } = presentation.physicalGeometry;
    const aspect = width / height;
    return aspect < 1 ? p.defaultLayout : l2;
  },
});

console.log(p);
