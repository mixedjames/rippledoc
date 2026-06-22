import type { StyleRegistry } from "../clientAPI/styles/StyleRegistry";
import type { ElementStyleProps } from "../clientAPI/styles/ElementStyleProps";
import type { SectionStyleProps } from "../clientAPI/styles/SectionStyleProps";
import type { NamedElementStyle } from "../clientAPI/styles/NamedElementStyle";
import type { NamedSectionStyle } from "../clientAPI/styles/NamedSectionStyle";

// ── CoreNamedElementStyle ─────────────────────────────────────────────────────

interface CoreNamedElementStyleOptions {
  name: string;
  props: ElementStyleProps;
  // Validates the new name against siblings; throws if taken.
  validateName: (name: string, self: CoreNamedElementStyle) => void;
  // Notifies the registry that this style's content has changed.
  onChange: () => void;
}

class CoreNamedElementStyle implements NamedElementStyle {
  private name_: string;
  private props_: ElementStyleProps;
  private readonly validateName_: (
    name: string,
    self: CoreNamedElementStyle,
  ) => void;
  private readonly onChange_: () => void;

  constructor(opts: CoreNamedElementStyleOptions) {
    this.name_ = opts.name;
    this.props_ = opts.props;
    this.validateName_ = opts.validateName;
    this.onChange_ = opts.onChange;
  }

  get name(): string {
    return this.name_;
  }

  get props(): ElementStyleProps {
    return this.props_;
  }

  setName(name: string): void {
    this.validateName_(name, this);
    this.name_ = name;
    this.onChange_();
  }

  setProps(props: ElementStyleProps): void {
    this.props_ = props;
    this.onChange_();
  }
}

// ── CoreNamedSectionStyle ─────────────────────────────────────────────────────

interface CoreNamedSectionStyleOptions {
  name: string;
  props: SectionStyleProps;
  validateName: (name: string, self: CoreNamedSectionStyle) => void;
  onChange: () => void;
}

class CoreNamedSectionStyle implements NamedSectionStyle {
  private name_: string;
  private props_: SectionStyleProps;
  private readonly validateName_: (
    name: string,
    self: CoreNamedSectionStyle,
  ) => void;
  private readonly onChange_: () => void;

  constructor(opts: CoreNamedSectionStyleOptions) {
    this.name_ = opts.name;
    this.props_ = opts.props;
    this.validateName_ = opts.validateName;
    this.onChange_ = opts.onChange;
  }

  get name(): string {
    return this.name_;
  }

  get props(): SectionStyleProps {
    return this.props_;
  }

  setName(name: string): void {
    this.validateName_(name, this);
    this.name_ = name;
    this.onChange_();
  }

  setProps(props: SectionStyleProps): void {
    this.props_ = props;
    this.onChange_();
  }
}

// ── CoreStyleRegistry ─────────────────────────────────────────────────────────

/**
 * Concrete implementation of StyleRegistry.
 *
 * Named styles are stored as objects and linked by reference. The name is a
 * user-visible label and serialisation key; renaming never requires touching
 * applied elements or sections.
 *
 * Deletion is guarded: the injected usage-checker callbacks allow CorePresentation
 * to walk the element/section tree and enforce the "not in use" contract.
 */
interface CoreStyleRegistryOptions {
  // Injected by CorePresentation so the registry can fan out recomputation.
  onElementStylesChanged: () => void;
  onSectionStylesChanged: () => void;
  // Injected by CorePresentation to enforce delete-if-in-use contract.
  isElementStyleInUse: (style: NamedElementStyle) => boolean;
  isSectionStyleInUse: (style: NamedSectionStyle) => boolean;
}

export class CoreStyleRegistry implements StyleRegistry {
  private readonly elementStyles_: CoreNamedElementStyle[] = [];
  private readonly sectionStyles_: CoreNamedSectionStyle[] = [];
  private globalElementStyle_: ElementStyleProps = {};
  private globalSectionStyle_: SectionStyleProps = {};

  private readonly onElementStylesChanged_: () => void;
  private readonly onSectionStylesChanged_: () => void;
  private readonly isElementStyleInUse_: (style: NamedElementStyle) => boolean;
  private readonly isSectionStyleInUse_: (style: NamedSectionStyle) => boolean;

  constructor(opts: CoreStyleRegistryOptions) {
    this.onElementStylesChanged_ = opts.onElementStylesChanged;
    this.onSectionStylesChanged_ = opts.onSectionStylesChanged;
    this.isElementStyleInUse_ = opts.isElementStyleInUse;
    this.isSectionStyleInUse_ = opts.isSectionStyleInUse;
  }

  // ── StyleRegistry (clientAPI) ─────────────────────────────────────────────

  createElementStyle(
    name: string,
    props: ElementStyleProps = {},
  ): NamedElementStyle {
    this.checkElementNameUnique_(name, null);
    const style = new CoreNamedElementStyle({
      name,
      props,
      validateName: (n, self) => this.checkElementNameUnique_(n, self),
      onChange: () => this.onElementStylesChanged_(),
    });
    this.elementStyles_.push(style);
    this.onElementStylesChanged_();
    return style;
  }

  deleteElementStyle(style: NamedElementStyle): void {
    if (this.isElementStyleInUse_(style)) {
      throw new Error(
        `Cannot delete named element style "${style.name}": it is still applied to one or more elements.`,
      );
    }
    const index = this.elementStyles_.indexOf(style as CoreNamedElementStyle);
    if (index < 0) {
      throw new Error(
        `Named element style "${style.name}" is not in this registry.`,
      );
    }
    this.elementStyles_.splice(index, 1);
    this.onElementStylesChanged_();
  }

  get elementStyles(): ReadonlyArray<NamedElementStyle> {
    return this.elementStyles_;
  }

  createSectionStyle(
    name: string,
    props: SectionStyleProps = {},
  ): NamedSectionStyle {
    this.checkSectionNameUnique_(name, null);
    const style = new CoreNamedSectionStyle({
      name,
      props,
      validateName: (n, self) => this.checkSectionNameUnique_(n, self),
      onChange: () => this.onSectionStylesChanged_(),
    });
    this.sectionStyles_.push(style);
    this.onSectionStylesChanged_();
    return style;
  }

  deleteSectionStyle(style: NamedSectionStyle): void {
    if (this.isSectionStyleInUse_(style)) {
      throw new Error(
        `Cannot delete named section style "${style.name}": it is still applied to one or more sections.`,
      );
    }
    const index = this.sectionStyles_.indexOf(style as CoreNamedSectionStyle);
    if (index < 0) {
      throw new Error(
        `Named section style "${style.name}" is not in this registry.`,
      );
    }
    this.sectionStyles_.splice(index, 1);
    this.onSectionStylesChanged_();
  }

  get sectionStyles(): ReadonlyArray<NamedSectionStyle> {
    return this.sectionStyles_;
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

  // ── Name uniqueness guards ────────────────────────────────────────────────

  // exclude is the style being renamed (skip self-comparison); null for create.
  private checkElementNameUnique_(
    name: string,
    exclude: CoreNamedElementStyle | null,
  ): void {
    if (this.elementStyles_.some((s) => s !== exclude && s.name === name)) {
      throw new Error(`Named element style "${name}" already exists.`);
    }
  }

  private checkSectionNameUnique_(
    name: string,
    exclude: CoreNamedSectionStyle | null,
  ): void {
    if (this.sectionStyles_.some((s) => s !== exclude && s.name === name)) {
      throw new Error(`Named section style "${name}" already exists.`);
    }
  }
}
