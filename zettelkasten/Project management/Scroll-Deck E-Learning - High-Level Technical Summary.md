# Scroll-Deck E-Learning: High-Level Technical Summary

## Technical Priorities

- **Lightweight and performant**: Runs smoothly on institutional hardware, including older Windows 10/11 machines.
- **Cross-platform output**: Single-file HTML, scalable viewport, responsive layout.
- **Structured content format**: DSL supporting slides, elements, and animations.
- **Separation of content and behavior**: Animations, parallax, and sticky elements defined declaratively.
- **Extensibility**: Language and renderer must allow future features without breaking backwards compatibility.
- **Authoring support**: Parser and renderer should provide meaningful feedback; optional Markdown inside text elements.

---

## Suggested Tech Stack

| Layer              | Technology / Approach                       | Rationale                                                                |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------ |
| Authoring Language | XML-style DSL with optional inline Markdown | Clear structure, easy to extend, readable for humans and machines        |
| Rendering          | HTML + CSS + JavaScript                     | Cross-platform, distributable as a single file, broad compatibility      |
| Animations         | CSS transitions + JS scroll listener        | Lightweight, flexible scroll-triggered effects, sticky/parallax behavior |
| Parsing            | JS-based parser                             | Converts DSL to HTML/JS; optionally includes validation                  |
| Build/Distribution | Optional bundler (esbuild/rollup)           | Single-file output with minimal external dependencies                    |
| Optional WYSIWYG   | Web-based editor                            | Future extension for authors preferring visual editing                   |

---

### Notes

- Focus is on **client-side rendering**, avoiding server dependencies.
- Must prioritize **simplicity and performance** over cutting-edge effects.
- Initial version should target **Windows, Mac, and Android**; iOS/Linux can be added later.
- Keep DSL minimal but **future-proof** for interactive content extensions.
