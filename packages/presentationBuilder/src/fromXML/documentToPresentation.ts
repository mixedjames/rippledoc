import type { ViewFactory, Presentation } from "@rippledoc/presentation";
import { PresentationBuilder } from "../builder/PresentationBuilder";
import { loadSectionsFromDocument } from "./sectionFromXML";

export function buildPresentationFromDocument(
  xmlDoc: Document,
  viewFactory: ViewFactory,
): Presentation {
  const builder = new PresentationBuilder({ viewFactory });

  // Parse <slideSize>
  const slideSize = xmlDoc.querySelector("slideSize");
  if (!slideSize) {
    throw new Error("Missing required <slideSize> element");
  }

  const width = slideSize.getAttribute("w");
  const height = slideSize.getAttribute("h");
  if (!width || !height) {
    throw new Error("<slideSize> must have both w and h attributes");
  }

  builder.setSlideWidth(Number(width));
  builder.setSlideHeight(Number(height));

  // Parse <section> and related child elements
  loadSectionsFromDocument(xmlDoc, builder);

  return builder.build();
}
