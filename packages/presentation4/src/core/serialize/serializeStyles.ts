import type { ElementStyleProps } from "../../clientAPI/styles/ElementStyleProps";
import type { SectionStyleProps } from "../../clientAPI/styles/SectionStyleProps";
import type { NamedElementStyle } from "../../clientAPI/styles/NamedElementStyle";
import type { NamedSectionStyle } from "../../clientAPI/styles/NamedSectionStyle";
import type {
  NamedElementStyleMemento,
  NamedSectionStyleMemento,
} from "../../clientAPI/serialize/PresentationMemento";

function hasKeys(obj: object): boolean {
  return Object.keys(obj).length > 0;
}

/**
 * Serializes the style bindings for an element: own style (if set) and the
 * ordered list of applied named style names.
 */
export function serializeElementStyles(
  ownStyle: ElementStyleProps,
  namedStyles: readonly NamedElementStyle[],
): { ownStyle?: ElementStyleProps; namedStyles: readonly string[] } {
  return {
    ...(hasKeys(ownStyle) ? { ownStyle } : {}),
    namedStyles: namedStyles.map((s) => s.name),
  };
}

/**
 * Serializes the style bindings for a section: own style (if set) and the
 * ordered list of applied named style names.
 */
export function serializeSectionStyles(
  ownStyle: SectionStyleProps,
  namedStyles: readonly NamedSectionStyle[],
): { ownStyle?: SectionStyleProps; namedStyles: readonly string[] } {
  return {
    ...(hasKeys(ownStyle) ? { ownStyle } : {}),
    namedStyles: namedStyles.map((s) => s.name),
  };
}

/**
 * Serializes the style registry: named style definitions and the author's
 * global overrides. Global overrides are omitted when not set (empty object).
 */
export function serializeStyleRegistry(params: {
  elementStyles: ReadonlyArray<NamedElementStyle>;
  sectionStyles: ReadonlyArray<NamedSectionStyle>;
  globalElementStyle: ElementStyleProps;
  globalSectionStyle: SectionStyleProps;
}): {
  elementStyles: readonly NamedElementStyleMemento[];
  sectionStyles: readonly NamedSectionStyleMemento[];
  globalElementStyle?: ElementStyleProps;
  globalSectionStyle?: SectionStyleProps;
} {
  const {
    elementStyles,
    sectionStyles,
    globalElementStyle,
    globalSectionStyle,
  } = params;
  return {
    elementStyles: elementStyles.map((s) => ({ name: s.name, props: s.props })),
    sectionStyles: sectionStyles.map((s) => ({ name: s.name, props: s.props })),
    ...(hasKeys(globalElementStyle) ? { globalElementStyle } : {}),
    ...(hasKeys(globalSectionStyle) ? { globalSectionStyle } : {}),
  };
}
