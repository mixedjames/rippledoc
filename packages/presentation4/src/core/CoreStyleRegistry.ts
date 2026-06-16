import type { StyleRegistry } from "../clientAPI/styles/StyleRegistry";
import type { ElementStyleProps } from "../clientAPI/styles/ElementStyleProps";
import type { SectionStyleProps } from "../clientAPI/styles/SectionStyleProps";

/**
 * Concrete implementation of StyleRegistry.
 *
 * Stores named styles and global overrides. Calls change callbacks when any
 * mutation occurs so CorePresentation can fan-out recomputation to all affected
 * elements or sections.
 */
export class CoreStyleRegistry implements StyleRegistry {
  private readonly elementStyles_ = new Map<string, ElementStyleProps>();
  private readonly sectionStyles_ = new Map<string, SectionStyleProps>();
  private globalElementStyle_: ElementStyleProps = {};
  private globalSectionStyle_: SectionStyleProps = {};

  // Called by CorePresentation to propagate registry-level changes.
  private readonly onElementStylesChanged_: () => void;
  private readonly onSectionStylesChanged_: () => void;

  constructor(
    onElementStylesChanged: () => void,
    onSectionStylesChanged: () => void,
  ) {
    this.onElementStylesChanged_ = onElementStylesChanged;
    this.onSectionStylesChanged_ = onSectionStylesChanged;
  }

  // ── StyleRegistry (clientAPI) ─────────────────────────────────────────────

  defineElementStyle(name: string, style: ElementStyleProps): void {
    this.elementStyles_.set(name, style);
    this.onElementStylesChanged_();
  }

  defineSectionStyle(name: string, style: SectionStyleProps): void {
    this.sectionStyles_.set(name, style);
    this.onSectionStylesChanged_();
  }

  get globalElementStyle(): ElementStyleProps {
    return this.globalElementStyle_;
  }

  setGlobalElementStyle(style: ElementStyleProps): void {
    this.globalElementStyle_ = style;
    this.onElementStylesChanged_();
  }

  get globalSectionStyle(): SectionStyleProps {
    return this.globalSectionStyle_;
  }

  setGlobalSectionStyle(style: SectionStyleProps): void {
    this.globalSectionStyle_ = style;
    this.onSectionStylesChanged_();
  }

  // ── Internal lookups for CoreElement / CoreSection ────────────────────────

  lookupElementStyle(name: string): ElementStyleProps | undefined {
    return this.elementStyles_.get(name);
  }

  lookupSectionStyle(name: string): SectionStyleProps | undefined {
    return this.sectionStyles_.get(name);
  }
}
