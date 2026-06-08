import * as p3 from "@rippledoc/presentation3";

const p = p3.createPresentation({
  slideWidth: 800,
  slideHeight: 600,
});

const s1 = p.addSection();
const s2 = p.addSection();

p.replaceView(
  p3.createV1PresentationView({
    container: "#theContainer",
  }),
);

console.log(p);
