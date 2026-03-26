/**
 * Loads XML content from either a URL or a text string.
 * Exactly one of the two options must be provided.
 *
 * @param options An object containing either a URL or a text string.
 * @returns A promise that resolves to the XML content as a string.
 */
export async function loadXMLSource(options: {
  url: string | URL;
  text?: string;
}): Promise<string> {
  const { url, text } = options;

  if ((url && text) || (!url && !text)) {
    throw new Error(
      "loadFromXML: exactly one of 'url' or 'text' must be provided",
    );
  }

  if (typeof text === "string") {
    return text;
  }

  // At this point we know url is defined.
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.statusText}`);
  }
  return response.text();
}
