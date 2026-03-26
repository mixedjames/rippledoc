import { Presentation } from "../presentation/Presentation";
import { loadXMLSource } from "./io/loadXMLSource";
import { parseXMLDocument } from "./io/parseXMLDocument";
import { loadPresentation } from "./loadPresentation";

export async function loadFromXML(options: {
  url: string | URL;
  text?: string;
}): Promise<Presentation> {
  const xmlText = await loadXMLSource(options);
  const dom = parseXMLDocument(xmlText);

  return loadPresentation({ dom });
}
