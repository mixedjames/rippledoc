/**
 * How an image fills its container.
 *
 * Maps to CSS `object-fit` for `<img>` elements and to `background-size` for
 * image-type fills on elements and sections.
 *
 * | Value     | <img> object-fit | background-size |
 * |-----------|------------------|-----------------|
 * | cover     | cover            | cover           |
 * | contain   | contain          | contain         |
 * | fill      | fill             | 100% 100%       |
 * | none      | none             | auto            |
 */
export type ImageFit = "cover" | "contain" | "fill" | "none";
