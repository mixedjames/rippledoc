import "../css/styles.css";
import { parseMarkdown } from "@rippledoc/markdown";

import { HTMLPresentationView, loadFromXML } from "@rippledoc/presentation2";

try {
  const p = await loadFromXML({ url: "presentations/demo1.xml" });

  const htmlView = new HTMLPresentationView({
    presentation: p,
    container: "#theContainer",
  });
} catch (e) {
  console.error("Compilation error:", e);
}
