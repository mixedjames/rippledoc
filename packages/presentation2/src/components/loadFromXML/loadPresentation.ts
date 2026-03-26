import { Presentation } from "../presentation/Presentation";
import { PresentationBuilder } from "../presentation/PresentationBuilder";
import { compilePresentation } from "../compilePresentation";
import { loadSection } from "./loadSection";

export async function loadPresentation(options: {
  dom: Document;
}): Promise<Presentation> {
  const presentationBuilder = new PresentationBuilder();

  if (
    !options.dom.firstChild ||
    options.dom.firstChild.nodeName !== "presentation"
  ) {
    throw new Error("Presentation XML must have a root <presentation> element");
  }

  Array.prototype.forEach.call(
    options.dom.children[0]!.children,
    (child: Element) => {
      switch (child.tagName) {
        case "size":
          loadSize({ element: child, presentationBuilder });
          return;

        case "section":
          loadSection({ element: child, presentationBuilder });
          return;

        default: // Ignore unknown tags for now
      }
    },
  );

  return compilePresentation(presentationBuilder);
}

function loadSize(options: {
  element: Element;
  presentationBuilder: PresentationBuilder;
}): void {
  const { element, presentationBuilder } = options;

  const width = element.getAttribute("w");
  const height = element.getAttribute("h");
  if (!width || !height) {
    throw new Error("<size> must have both w and h attributes");
  }

  presentationBuilder.basisDimensions.width = Number(width);
  presentationBuilder.basisDimensions.height = Number(height);
}
