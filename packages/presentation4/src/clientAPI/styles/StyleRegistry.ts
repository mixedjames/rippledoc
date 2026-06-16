import type { ElementStyleProps } from "./ElementStyleProps";
import type { SectionStyleProps } from "./SectionStyleProps";

/**
 * Manages named styles and the author's global style overrides for a presentation.
 *
 * Named styles work like CSS classes: authors define a named style once and apply
 * it by name to any number of elements or sections. When multiple named styles are
 * applied to the same object, the first-specified takes priority (unlike CSS, which
 * uses last-specified).
 *
 * The global styles here are the author's overrides — they sit above the system
 * defaults in the cascade but below any named or own styles. Omitting them entirely
 * is valid; the system defaults will apply.
 */
export interface StyleRegistry {
  /**
   * Define or replace a named style for elements.
   * Overwrites silently if the name already exists.
   */
  defineElementStyle(name: string, style: ElementStyleProps): void;

  /**
   * Define or replace a named style for sections.
   * Overwrites silently if the name already exists.
   */
  defineSectionStyle(name: string, style: SectionStyleProps): void;

  /** The author's global element style override. Partial — merged with system defaults. */
  get globalElementStyle(): ElementStyleProps;
  setGlobalElementStyle(style: ElementStyleProps): void;

  /** The author's global section style override. Partial — merged with system defaults. */
  get globalSectionStyle(): SectionStyleProps;
  setGlobalSectionStyle(style: SectionStyleProps): void;
}
