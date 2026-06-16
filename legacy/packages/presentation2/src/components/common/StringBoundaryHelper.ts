/**
 * Checks whether a given string contains a specific token such that
 * the characters immediately before and after the token (if present)
 * are not alphanumeric (A–Z, a–z, 0–9).
 *
 * This is useful when you want to match a token only when it is not
 * part of a larger identifier or word.
 */
export function containsIsolatedToken(
  haystack: string,
  token: string,
): boolean {
  if (!token || token.length > haystack.length) {
    return false;
  }

  let fromIndex = 0;

  // Scan for all occurrences of the token
  while (fromIndex <= haystack.length - token.length) {
    const index = haystack.indexOf(token, fromIndex);

    // Not magic: -1 is well known as the "not found" return value for indexOf
    // eslint-disable-next-line no-magic-numbers
    if (index === -1) {
      return false;
    }

    const beforeIndex = index - 1;
    const afterIndex = index + token.length;

    const beforeChar =
      beforeIndex >= 0 ? haystack.charAt(beforeIndex) : undefined;
    const afterChar =
      afterIndex < haystack.length ? haystack.charAt(afterIndex) : undefined;

    const beforeIsAlphaNumeric =
      beforeChar !== undefined && isAlphaNumeric(beforeChar);
    const afterIsAlphaNumeric =
      afterChar !== undefined && isAlphaNumeric(afterChar);

    // Both neighbors (if any) must NOT be alphanumeric
    if (!beforeIsAlphaNumeric && !afterIsAlphaNumeric) {
      return true;
    }

    // Continue searching from the next character after this match
    fromIndex = index + 1;
  }

  return false;
}

function isAlphaNumeric(ch: string): boolean {
  if (!ch) {
    return false;
  }

  const code = ch.charCodeAt(0);

  // 0–9
  // eslint-disable-next-line no-magic-numbers
  if (code >= 48 && code <= 57) {
    return true;
  }

  // A–Z
  // eslint-disable-next-line no-magic-numbers
  if (code >= 65 && code <= 90) {
    return true;
  }

  // a–z
  // eslint-disable-next-line no-magic-numbers
  if (code >= 97 && code <= 122) {
    return true;
  }

  return false;
}
