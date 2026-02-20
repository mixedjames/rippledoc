import { Module } from "@rippledoc/expressions";
import type { Expression } from "@rippledoc/expressions";

import type {
  ViewFactory,
  Section,
  Presentation,
} from "@rippledoc/presentation";
import { Element, Style, ScrollTrigger } from "@rippledoc/presentation";
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
      const expr = this.expressions_.get(key);
      if (!expr) {
        throw new Error(`Missing layout expression: ${key}`);
      }

      const getter = this.module_.addExpression(key, expr);
      this.getters_.set(key, getter);
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

  private validateAndDeriveLayout(): void {
    // ----- Horizontal -----
    const hasLeft = this.expressions_.has("left");
    const hasWidth = this.expressions_.has("width");
    const hasRight = this.expressions_.has("right");

    const horizontalCount = [hasLeft, hasWidth, hasRight].filter(
      Boolean,
    ).length;

    if (horizontalCount !== 2) {
      throw new Error(
        "ElementBuilder: Must specify exactly 2 of (left, width, right)",
      );
    }

    if (!hasLeft) {
      this.expressions_.set("left", "right - width");
    } else if (!hasWidth) {
      this.expressions_.set("width", "right - left");
    } else if (!hasRight) {
      this.expressions_.set("right", "left + width");
    }

    // ----- Vertical -----
    const hasTop = this.expressions_.has("top");
    const hasHeight = this.expressions_.has("height");
    const hasBottom = this.expressions_.has("bottom");

    const verticalCount = [hasTop, hasHeight, hasBottom].filter(Boolean).length;

    if (verticalCount !== 2) {
      throw new Error(
        "ElementBuilder: Must specify exactly 2 of (top, height, bottom)",
      );
    }

    if (!hasTop) {
      this.expressions_.set("top", "bottom - height");
    } else if (!hasHeight) {
      this.expressions_.set("height", "bottom - top");
    } else if (!hasBottom) {
      this.expressions_.set("bottom", "top + height");
    }
  }

  protected assertNotBuilt(method: string): void {
    if (this.built_) {
      throw new Error(
        `ElementBuilder.${method}: Builder is no longer usable after build()`,
      );
    }
  }
}
