import type { PresentationFromXMLConfig } from "./PresentationFromXML";

export async function loadXmlSource(
  config: PresentationFromXMLConfig,
): Promise<string> {
  const { url, text } = config;

  if ((url && text) || (!url && !text)) {
    throw new Error(
      "presentationFromXML: exactly one of 'url' or 'text' must be provided",
    );
  }

  if (typeof text === "string") {
    return text;
  }

  // At this point we know url is defined.
  const response = await fetch(url!);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.statusText}`);
  }
  return response.text();
}

export function parseXmlDocument(xmlText: string): Document {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent ?? ""}`);
  }
  return xmlDoc;
}
