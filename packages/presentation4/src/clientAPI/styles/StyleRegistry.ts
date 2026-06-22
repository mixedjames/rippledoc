import type { ElementStyleProps } from "./ElementStyleProps";
import type { SectionStyleProps } from "./SectionStyleProps";
import type { NamedElementStyle } from "./NamedElementStyle";
import type { NamedSectionStyle } from "./NamedSectionStyle";

/**
 * Manages named styles and the author's global style overrides for a presentation.
 *
 * Named styles work like CSS classes: authors define a named style once and apply
 * it by reference to any number of elements or sections. When multiple named styles
 * are applied to the same object, the first-specified takes priority (unlike CSS,
 * which uses last-specified).
 *
 * Styles are linked by object reference, not by name. The name is a user-visible
 * label and the serialisation key; renaming a style does not affect applied elements
 * or sections.
 *
 * Element styles and section styles are independent namespaces.
 *
 * The global styles here are the author's overrides — they sit above the system
 * defaults in the cascade but below any named or own styles.
 */
export interface StyleRegistry {
  /**
   * Create a new named element style and add it to the registry.
   * Throws if a style with the given name already exists.
   */
  createElementStyle(
    name: string,
    props?: ElementStyleProps,
  ): NamedElementStyle;

  /**
   * Remove a named element style from the registry.
   * Throws if any element currently has this style applied.
   */
  deleteElementStyle(style: NamedElementStyle): void;

  /** All named element styles, in creation order. */
  get elementStyles(): ReadonlyArray<NamedElementStyle>;

  /**
   * Create a new named section style and add it to the registry.
   * Throws if a style with the given name already exists.
   */
  createSectionStyle(
    name: string,
    props?: SectionStyleProps,
  ): NamedSectionStyle;

  /**
   * Remove a named section style from the registry.
   * Throws if any section currently has this style applied.
   */
  deleteSectionStyle(style: NamedSectionStyle): void;

  /** All named section styles, in creation order. */
  get sectionStyles(): ReadonlyArray<NamedSectionStyle>;

  /** The author's global element style override. Partial — merged with system defaults. */
  get globalElementStyle(): ElementStyleProps;
  setGlobalElementStyle(style: ElementStyleProps): void;

  /** The author's global section style override. Partial — merged with system defaults. */
  get globalSectionStyle(): SectionStyleProps;
  setGlobalSectionStyle(style: SectionStyleProps): void;
}
