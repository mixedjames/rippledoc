# RippleDoc — AI Context Reference

## Sanitizer: safety-critical infrastructure

`@rippledoc/sanitizer` is the XSS security boundary for all user-supplied content rendered into the DOM. A bypass creates a direct XSS vulnerability in the editor.

**Rules — no exceptions:**

- Never import DOMPurify (or any other sanitizer) directly outside `packages/sanitizer/`. All sanitization must go through the functions exported by `@rippledoc/sanitizer`.
- Never remove, skip, or reorder a sanitization call, even to fix a seemingly unrelated bug (e.g. a parsing issue downstream of the sanitizer output).
- Never change the sanitization approach — allowed profiles, `IN_PLACE` vs string mode, `WHOLE_DOCUMENT`, custom hooks — without explicit written approval from the user.

**Process:** If a bug requires changing how sanitization works, stop, describe the problem and proposed options in plain text, and wait for a go-ahead before touching any code in `packages/sanitizer/` or any call site that imports from it.

This constraint overrides any instruction to "just fix it" or to work around a problem as quickly as possible.
