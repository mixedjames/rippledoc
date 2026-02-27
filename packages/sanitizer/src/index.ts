import DOMPurify from "dompurify";

/**
 * Sanitize HTML string to prevent XSS attacks.
 *
 * Note: This function uses DOMPurify under the hood, however this is an implementation detail and
 * may change in the future. Do not rely on this function using DOMPurify specifically, but rather
 * just that it sanitizes HTML strings effectively.
 *
 * FIXME: This function currently only allows the default HTML profile, which will be too
 * restrictive once we start allowing things like maths.
 *
 * @param dirty The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  });
}

/**
 * Sanitize SVG string to prevent XSS attacks.
 *
 * Note: This function uses DOMPurify under the hood, however this is an implementation detail and
 * may change in the future. Do not rely on this function using DOMPurify specifically, but rather
 * just that it sanitizes SVG strings effectively.
 *
 * @param dirty The SVG string to sanitize.
 * @returns The sanitized SVG string.
 */
export function sanitizeSVG(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
}
