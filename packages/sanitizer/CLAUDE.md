# sanitizer — AI Context Reference

## Purpose

This package is the **sole XSS security boundary** for all user-supplied content in RippleDoc. It wraps DOMPurify and exposes two functions:

- `sanitizeHTML(dirty: string): string` — for markdown/HTML content
- `sanitizeSVG(dirty: string): string` — for inline SVG content

All other packages must import from `@rippledoc/sanitizer`. Direct DOMPurify imports outside this package are forbidden.

## Safety rules

See the repo-level [`CLAUDE.md`](../../CLAUDE.md) for the full constraint. In brief: **any change to this package — profiles, modes, allowed tags/attributes, hooks — requires explicit human approval before any code is written.** Propose and wait for a go-ahead; do not implement first.

## Known behaviour

`sanitizeSVG` serialises through HTML `innerHTML` (DOMPurify's internal mechanism), so its string output contains the `<svg>` wrapper but without an explicit `xmlns` attribute. Callers that need to parse the result back into a DOM node must use an HTML parser (`DOMParser` with `"text/html"`) rather than an XML parser (`"image/svg+xml"`), because the XML parser requires a valid namespace declaration and will produce a `<parseerror>` document without one.
