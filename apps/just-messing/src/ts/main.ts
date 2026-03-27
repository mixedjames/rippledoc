import "../css/styles.css";
import { parseMarkdown } from "@rippledoc/markdown";

import { HTMLPresentationView, loadFromXML } from "@rippledoc/presentation2";

try {
  const p = await loadFromXML({ url: "presentations/demo1.xml" });

  console.log(p);

  const htmlView = new HTMLPresentationView({
    presentation: p,
    container: "#theContainer",
  });

  const st = p.sections[1]!.scrollTriggers[0]!;
  const e = document.querySelector(".rdoc-element-img1")! as HTMLElement;

  const a = e.animate([{ opacity: 1 }, { opacity: 0 }], {
    fill: "both",
    duration: 200,
  });

  a.pause();

  st.on("start", () => {
    a.playbackRate = 1;
    a.play();
  });

  st.on("reverseEnd", () => {
    a.pause();
    a.currentTime = 0;
  });

  st.on("reverseStart", () => {
    a.playbackRate = -1;
    a.play();
  });

  st.on("end", () => {
    a.pause();
    a.currentTime = 200;
  });
} catch (e) {
  console.error("Compilation error:", e);
}
