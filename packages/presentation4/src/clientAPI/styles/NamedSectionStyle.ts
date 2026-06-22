import type { SectionStyleProps } from "./SectionStyleProps";

/**
 * A named style that can be applied to sections.
 *
 * Identity is by object reference — sections hold a direct reference to this
 * object, not a name string. The name is a user-visible label and also serves
 * as the serialisation key (and therefore must be unique within the
 * presentation's section styles).
 *
 * Element styles and section styles are independent namespaces: the same name
 * may exist in both without conflict.
 */
export interface NamedSectionStyle {
  /** User-visible label and serialisation key. Unique within section styles. */
  get name(): string;
  /** The style properties contributed by this named style to the cascade. */
  get props(): SectionStyleProps;

  /**
   * Rename this style. Throws if the new name is already taken by another
   * section style in the same registry.
   */
  setName(name: string): void;
  /** Replace the style properties. Triggers cascade recomputation on all users. */
  setProps(props: SectionStyleProps): void;
}
