import * as p3 from "@rippledoc/presentation3";

const p = new p3.Presentation({
  slideWidth: 800,
  slideHeight: 600,
});

const s1 = p.addSection();
const s2 = p.addSection();

console.log(s1);
console.log(s2);
