import type { ViewFactory, Presentation } from "@rippledoc/presentation";
import { loadXmlSource, parseXmlDocument } from "./xmlSource";
import { buildPresentationFromDocument } from "./documentToPresentation";

export interface PresentationFromXMLConfig {
  viewFactory: ViewFactory;
  url?: string | URL;
  text?: string;
}

/**
 * Build a Presentation from XML using either a URL or an in-memory string.
 *
 * Exactly one of `url` or `text` must be provided.
 */
export async function presentationFromXML(
  config: PresentationFromXMLConfig,
): Promise<Presentation> {
  const xmlText = await loadXmlSource(config);
  const xmlDoc = parseXmlDocument(xmlText);
  return buildPresentationFromDocument(xmlDoc, config.viewFactory);
}
