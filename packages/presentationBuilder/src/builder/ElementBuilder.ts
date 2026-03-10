import { Module } from "@rippledoc/expressions";
import { Expression } from "@rippledoc/expressions";

import type {
  ViewFactory,
  Section,
  Presentation,
} from "@rippledoc/presentation";
import {
  Element,
  Style,
  ScrollTrigger,
  ContentDependentDimension,
} from "@rippledoc/presentation";
import { ScrollTriggerBuilder } from "./ScrollTriggerBuilder";

/**
 * Layout properties supported by an Element.
 */
type LayoutKey = "left" | "right" | "width" | "top" | "bottom" | "height";

/**
 * Builder for an Element within a Section.
 *
 * Responsibilities:
 * - Collect layout intent as expressions (strings)
 * - Validate layout constraints
 * - Derive missing layout expressions
 * - Expose bound expressions after module compilation
 *
 * This builder has no knowledge of expression phases.
 */
export class ElementBuilder {
  private readonly module_: Module;
  private readonly viewFactory_: ViewFactory;
  private name_ = "";

  private prevElementBuilder_: ElementBuilder | null = null;
  private nextElementBuilder_: ElementBuilder | null = null;

  private readonly expressions_ = new Map<LayoutKey, string>();
  private readonly getters_ = new Map<LayoutKey, () => Expression>();
  private style_: Style = new Style();

  private contentDependentDimension_: ContentDependentDimension =
    ContentDependentDimension.None;

  private replaceNativeFunction_: ((fn: () => number) => void) | null = null;

  private readonly scrollTriggerBuilders_: ScrollTriggerBuilder[] = [];

  private built_ = false;

  constructor(options: { parentModule: Module; viewFactory: ViewFactory }) {
    const { parentModule, viewFactory } = options;
    this.module_ = parentModule.addSubModule();
    this.viewFactory_ = viewFactory;
  }

  // ─────────────────────────────────────────────────────────────
  // Construction-phase API
  // ─────────────────────────────────────────────────────────────

  setName(name: string): void {
    this.assertNotBuilt("setName");
    this.name_ = name;
  }

  getName(): string {
    return this.name_;
  }

  setContentDependentDimension(d: ContentDependentDimension): void {
    this.assertNotBuilt("setContentDependentDimension");

    const key = this.getContentDependentLayoutKey(d);
    if (key && this.expressions_.has(key)) {
      throw new Error(
        `ElementBuilder.setContentDependentDimension: cannot mark '${d}' as content-dependent when an explicit expression has already been provided for ${key}`,
      );
    }

    this.contentDependentDimension_ = d;
  }

  setLeft(expr: string): void {
    this.setExpression("left", expr);
  }

  setRight(expr: string): void {
    this.setExpression("right", expr);
  }

  setWidth(expr: string): void {
    this.setExpression("width", expr);
  }

  setTop(expr: string): void {
    this.setExpression("top", expr);
  }

  setBottom(expr: string): void {
    this.setExpression("bottom", expr);
  }

  setHeight(expr: string): void {
    this.setExpression("height", expr);
  }

  private setExpression(key: LayoutKey, expr: string): void {
    this.assertNotBuilt("setExpression");

    if (this.isContentDependentKey(key)) {
      throw new Error(
        `ElementBuilder.setExpression: cannot set expression for content-dependent dimension '${key}'`,
      );
    }

    if (!expr || typeof expr !== "string") {
      throw new Error(`ElementBuilder: Invalid expression for ${key}`);
    }

    this.expressions_.set(key, expr);
  }

  get style(): Style {
    this.assertNotBuilt("style");
    return this.style_;
  }

  setPrevious(prev: ElementBuilder): void {
    this.assertNotBuilt("setPrevious");
    if (this.prevElementBuilder_) {
      throw new Error(
        "ElementBuilder.setPrevious: previous element already set",
      );
    }

    // Expose the previous element's module as a mapped module so
    // expressions like "prevElement.left" can be resolved
    // by the expressions module system.

    this.prevElementBuilder_ = prev;
    this.module_.mapModule("prevElement", prev.moduleInstance);
  }

  setNext(next: ElementBuilder): void {
    this.assertNotBuilt("setNext");

    if (this.nextElementBuilder_) {
      throw new Error("ElementBuilder.setNext: next element already set");
    }

    // Expose the next element's module as a mapped module so
    // expressions like "nextElement.left" can be resolved
    // by the expressions module system.

    this.nextElementBuilder_ = next;
    this.module_.mapModule("nextElement", next.moduleInstance);
  }

  get moduleInstance(): Module {
    return this.module_;
  }

  /**
   * Finalizes layout intent:
   * - Validates constraints
   * - Derives missing expressions
   * - Registers expressions with the module
   * - Finalizes any associated scroll triggers
   *
   * Must be called before module compilation.
   */
  finalize(): void {
    this.assertNotBuilt("finalize");

    this.validateAndDeriveLayout();
    this.registerExpressions();

    // Finalize any scroll trigger builders so their expressions are
    // registered with their private submodules before compilation.
    this.scrollTriggerBuilders_.forEach((builder) => {
      builder.finalize();
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Build phase
  // ─────────────────────────────────────────────────────────────

  build(options: { parent: Section }): Element {
    this.assertNotBuilt("build");
    this.built_ = true;

    const { parent } = options;

    return new Element(this.getBuildOptions({ parent }));
  }

  protected getBuildOptions(options: { parent: Section }) {
    const presentation: Presentation = options.parent.parent;
    const scrollTriggers = this.buildScrollTriggers(presentation);

    return {
      name: this.name_,
      parent: options.parent,
      left: this.get("left"),
      right: this.get("right"),
      width: this.get("width"),
      top: this.get("top"),
      bottom: this.get("bottom"),
      height: this.get("height"),
      contentDependentDimension: this.contentDependentDimension_,
      replaceNativeFunction: this.replaceNativeFunction_ ?? undefined,
      style: this.style_,
      viewFactory: this.viewFactory_,
      scrollTriggers,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────────────────────

  private get(key: LayoutKey): Expression {
    const getter = this.getters_.get(key);
    if (!getter) {
      throw new Error(`ElementBuilder: Expression '${key}' not registered`);
    }
    return getter();
  }

  private registerExpressions(): void {
    const keys: LayoutKey[] = [
      "left",
      "right",
      "width",
      "top",
      "bottom",
      "height",
    ];

    for (const key of keys) {
      if (this.isContentDependentKey(key)) {
        const { getExpression, replaceNativeFunction } =
          this.module_.addNativeExpression2(
            key,
            () => {
              throw new Error(
                `ElementBuilder: content-dependent expression '${key}' evaluated before view initialisation`,
              );
            },
            this.getDependenciesForContentDependentKey(key),
          );

        this.getters_.set(key, getExpression);
        this.replaceNativeFunction_ = replaceNativeFunction;
      } else {
        const expr = this.expressions_.get(key);
        if (!expr) {
          throw new Error(`Missing layout expression: ${key}`);
        }

        const getter = this.module_.addExpression(key, expr);
        this.getters_.set(key, getter);
      }
    }
  }

  /**
   * Create a new scroll trigger associated with this element.
   *
   * The trigger's expressions are stored in a private submodule so they
   * do not leak into the element's public expression namespace.
   */
  createScrollTrigger(): ScrollTriggerBuilder {
    this.assertNotBuilt("createScrollTrigger");

    const builder = new ScrollTriggerBuilder({
      parentModule: this.module_,
    });

    this.scrollTriggerBuilders_.push(builder);
    return builder;
  }

  private buildScrollTriggers(presentation: Presentation): ScrollTrigger[] {
    return this.scrollTriggerBuilders_.map((builder) =>
      builder.build({ presentation }),
    );
  }

  // Validate and derive layout expressions for both axes.
  // Split into axis-specific helpers so constraints are easier to read and verify.
  private validateAndDeriveLayout(): void {
    this.validateAndDeriveHorizontalLayout();
    this.validateAndDeriveVerticalLayout();
  }

  // Handle horizontal layout (left, width, right), delegating to
  // content-dependent or fixed-width flows based on configuration.
  private validateAndDeriveHorizontalLayout(): void {
    const hasLeft = this.expressions_.has("left");
    const hasWidth = this.expressions_.has("width");
    const hasRight = this.expressions_.has("right");

    const widthIsContent =
      this.contentDependentDimension_ === ContentDependentDimension.Width;

    if (widthIsContent) {
      this.validateAndDeriveContentDependentWidth({ hasLeft, hasRight });
    } else {
      this.validateAndDeriveFixedWidth({ hasLeft, hasWidth, hasRight });
    }
  }

  // Handle vertical layout (top, height, bottom), delegating to
  // content-dependent or fixed-height flows based on configuration.
  private validateAndDeriveVerticalLayout(): void {
    const hasTop = this.expressions_.has("top");
    const hasHeight = this.expressions_.has("height");
    const hasBottom = this.expressions_.has("bottom");

    const heightIsContent =
      this.contentDependentDimension_ === ContentDependentDimension.Height;

    if (heightIsContent) {
      this.validateAndDeriveContentDependentHeight({ hasTop, hasBottom });
    } else {
      this.validateAndDeriveFixedHeight({ hasTop, hasHeight, hasBottom });
    }
  }

  // Content-dependent width: enforce "no explicit width" and
  // "exactly one anchor", then derive the missing anchor.
  private validateAndDeriveContentDependentWidth(options: {
    hasLeft: boolean;
    hasRight: boolean;
  }): void {
    const { hasLeft, hasRight } = options;

    if (this.expressions_.has("width")) {
      throw new Error(
        "ElementBuilder: width cannot have an explicit expression when it is content-dependent",
      );
    }

    const anchors = this.countSpecified(hasLeft, hasRight);

    this.requireExactly(
      anchors,
      1,
      "ElementBuilder: When width is content-dependent, you must specify exactly one of (left, right)",
    );

    // Derive the missing horizontal anchor in terms of the
    // content-dependent width so that all layout expressions
    // are available to the module.
    if (hasLeft && !hasRight) {
      this.expressions_.set("right", "left + width");
    } else if (hasRight && !hasLeft) {
      this.expressions_.set("left", "right - width");
    }
    // Do not derive width; it will be provided by the view at runtime and we provide a native
    // expression that will be used to route the view-provided value at runtime.
  }

  // Fixed width: require exactly two of (left, width, right) and
  // derive the missing one so all three expressions are available.
  private validateAndDeriveFixedWidth(options: {
    hasLeft: boolean;
    hasWidth: boolean;
    hasRight: boolean;
  }): void {
    const { hasLeft, hasWidth, hasRight } = options;

    const horizontalCount = this.countSpecified(hasLeft, hasWidth, hasRight);

    this.requireExactly(
      horizontalCount,
      2,
      "ElementBuilder: Must specify exactly 2 of (left, width, right)",
    );

    if (!hasLeft) {
      this.expressions_.set("left", "right - width");
    } else if (!hasWidth) {
      this.expressions_.set("width", "right - left");
    } else if (!hasRight) {
      this.expressions_.set("right", "left + width");
    }
  }

  // Content-dependent height: enforce "no explicit height" and
  // "exactly one anchor", then derive the missing anchor.
  private validateAndDeriveContentDependentHeight(options: {
    hasTop: boolean;
    hasBottom: boolean;
  }): void {
    const { hasTop, hasBottom } = options;

    if (this.expressions_.has("height")) {
      throw new Error(
        "ElementBuilder: height cannot have an explicit expression when it is content-dependent",
      );
    }

    const anchors = this.countSpecified(hasTop, hasBottom);

    this.requireExactly(
      anchors,
      1,
      "ElementBuilder: When height is content-dependent, you must specify exactly one of (top, bottom)",
    );

    // Derive the missing vertical anchor in terms of the
    // content-dependent height so that all layout expressions
    // are available to the module.
    if (hasTop && !hasBottom) {
      this.expressions_.set("bottom", "top + height");
    } else if (hasBottom && !hasTop) {
      this.expressions_.set("top", "bottom - height");
    }
    // Do not derive height; it will be provided by the view at runtime and we
    // provide a native expression that will be used to route the view-provided value at runtime.
  }

  // Fixed height: require exactly two of (top, height, bottom) and
  // derive the missing one so all three expressions are available.
  private validateAndDeriveFixedHeight(options: {
    hasTop: boolean;
    hasHeight: boolean;
    hasBottom: boolean;
  }): void {
    const { hasTop, hasHeight, hasBottom } = options;

    const verticalCount = this.countSpecified(hasTop, hasHeight, hasBottom);

    this.requireExactly(
      verticalCount,
      2,
      "ElementBuilder: Must specify exactly 2 of (top, height, bottom)",
    );

    if (!hasTop) {
      this.expressions_.set("top", "bottom - height");
    } else if (!hasHeight) {
      this.expressions_.set("height", "bottom - top");
    } else if (!hasBottom) {
      this.expressions_.set("bottom", "top + height");
    }
  }

  // Count how many of the given flags are specified; used to express
  // "exactly N of these must be provided" layout rules.
  private countSpecified(...flags: boolean[]): number {
    return flags.filter(Boolean).length;
  }

  // Shared helper to enforce "exactly N" constraints so the
  // error-throwing pattern is consistent and easy to scan.
  private requireExactly(
    count: number,
    expected: number,
    message: string,
  ): void {
    if (count !== expected) {
      throw new Error(message);
    }
  }

  private isContentDependentKey(key: LayoutKey): boolean {
    if (this.contentDependentDimension_ === ContentDependentDimension.Width) {
      return key === "width";
    }
    if (this.contentDependentDimension_ === ContentDependentDimension.Height) {
      return key === "height";
    }
    return false;
  }

  private getContentDependentLayoutKey(
    d: ContentDependentDimension,
  ): LayoutKey | null {
    if (d === ContentDependentDimension.Width) {
      return "width";
    }
    if (d === ContentDependentDimension.Height) {
      return "height";
    }
    return null;
  }

  private getDependenciesForContentDependentKey(key: LayoutKey): string[] {
    if (
      this.contentDependentDimension_ === ContentDependentDimension.Width &&
      key === "width"
    ) {
      // width depends on the non-dependent dimension: height
      return ["height"];
    }

    if (
      this.contentDependentDimension_ === ContentDependentDimension.Height &&
      key === "height"
    ) {
      // height depends on the non-dependent dimension: width
      return ["width"];
    }

    return [];
  }

  protected assertNotBuilt(method: string): void {
    if (this.built_) {
      throw new Error(
        `ElementBuilder.${method}: Builder is no longer usable after build()`,
      );
    }
  }
}
