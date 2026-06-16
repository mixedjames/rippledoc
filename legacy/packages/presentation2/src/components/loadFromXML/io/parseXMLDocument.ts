/**
 * Parses an XML string into a Document object.
 */
export function parseXMLDocument(xmlText: string): Document {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent ?? ""}`);
  }
  return xmlDoc;
}
