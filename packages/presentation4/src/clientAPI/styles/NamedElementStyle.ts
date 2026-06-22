import type { ElementStyleProps } from "./ElementStyleProps";

/**
 * A named style that can be applied to elements.
 *
 * Identity is by object reference — elements hold a direct reference to this
 * object, not a name string. The name is a user-visible label and also serves
 * as the serialisation key (and therefore must be unique within the
 * presentation's element styles).
 *
 * Renaming is O(1): change the label on this object. Applied elements are
 * unaffected because they reference the object, not the name.
 */
export interface NamedElementStyle {
  /** User-visible label and serialisation key. Unique within element styles. */
  get name(): string;
  /** The style properties contributed by this named style to the cascade. */
  get props(): ElementStyleProps;

  /**
   * Rename this style. Throws if the new name is already taken by another
   * element style in the same registry.
   */
  setName(name: string): void;
  /** Replace the style properties. Triggers cascade recomputation on all users. */
  setProps(props: ElementStyleProps): void;
}
