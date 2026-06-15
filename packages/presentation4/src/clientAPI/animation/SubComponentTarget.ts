/**
 * An opaque reference to a named sub-element inside an SVG image.
 *
 * Created via SVGImageElement.subComponent(selector). The selector is a CSS
 * selector string resolved against the loaded SVG DOM by the view at runtime.
 * SVG images load asynchronously, so resolution is deferred to the view layer.
 *
 * DOM types are intentionally absent from this interface — the clientAPI
 * carries only the selector string; the view owns the DOM lookup.
 */
export interface SubComponentTarget {
  readonly selector: string;
}
