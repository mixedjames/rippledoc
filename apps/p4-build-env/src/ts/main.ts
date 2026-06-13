import {
  createPresentation,
  constant,
  offsetFrom,
} from "@rippledoc/presentation4";
import { createEditorView } from "@rippledoc/view-editor";

const presentation = createPresentation({ basisWidth: 1000, basisHeight: 800 });

const section1 = presentation.root.addSection();
section1.setVerticalAnchors({ top: constant(0), height: constant(600) });

const section2 = presentation.root.addSection();
section2.setVerticalAnchors({ top: constant(600), height: constant(400) });

const el = section1.addMarkdownElement("# Hello from presentation4");
el.setHorizontalAnchors({ left: constant(50), width: constant(600) });
el.setVerticalAnchors({
  top: offsetFrom(section1.anchors.top, 40),
  height: constant(80),
});

presentation.attachView(createEditorView({ container: "#theContainer" }));
