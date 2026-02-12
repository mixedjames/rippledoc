import { Module } from "@rippledoc/expressions";
import type { Expression } from "@rippledoc/expressions";

import type { ViewFactory } from "../view/ViewFactory";
import type { Presentation } from "../Presentation";
import { Section } from "../Section";
import { Style } from "../Styles";
import { ElementBuilder } from "./ElementBuilder";
import { ImageElementBuilder } from "./ImageElementBuilder";

/**
 * Builder for a Section within a Presentation.
 *
 * Responsibilities:
 * - Collect section layout intent as expressions (strings)
 * - Collect ElementBuilder children
 * - Validate constraints and derive missing expressions
 * - Register expressions with its own Module
 */
export class SectionBuilder {
  private readonly module_: Module;
  private readonly viewFactory_: ViewFactory;
  private readonly elements_: ElementBuilder[] = [];
  private name_ = "";

  private readonly style_: Style = new Style();

  private prevSectionBuilder_: SectionBuilder | null = null;
  private nextSectionBuilder_: SectionBuilder | null = null;

  private readonly expressions_ = new Map<
    "sectionTop" | "sectionHeight" | "sectionBottom",
    string
  >();

  private getters_ = new Map<
    "sectionTop" | "sectionHeight" | "sectionBottom",
    () => Expression
  >();

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

  get style(): Style {
    this.assertNotBuilt("style");
    return this.style_;
  }

  setPrevious(prev: SectionBuilder): void {
    this.assertNotBuilt("setPrevious");
    if (this.prevSectionBuilder_) {
      throw new Error(
        "SectionBuilder.setPrevious: previous section already set",
      );
    }

    // Expose the previous section's module as a mapped module so
    // expressions like "prevSection.sectionBottom" can be resolved
    // by the expressions module system.

    this.prevSectionBuilder_ = prev;
    this.module_.mapModule("prevSection", prev.moduleInstance);
  }

  setNext(next: SectionBuilder): void {
    this.assertNotBuilt("setNext");

    if (this.nextSectionBuilder_) {
      throw new Error("SectionBuilder.setNext: next section already set");
    }

    // Expose the next section's module as a mapped module so
    // expressions like "nextSection.sectionTop" can be resolved
    // by the expressions module system.

    this.nextSectionBuilder_ = next;
    this.module_.mapModule("nextSection", next.moduleInstance);
  }

  setHeight(expr: string): void {
    this.assertNotBuilt("setHeight");
    if (this.expressions_.has("sectionBottom")) {
      throw new Error("Cannot set both height and bottom");
    }
    this.expressions_.set("sectionHeight", expr);
  }

  setBottom(expr: string): void {
    this.assertNotBuilt("setBottom");
    if (this.expressions_.has("sectionHeight")) {
      throw new Error("Cannot set both height and bottom");
    }
    this.expressions_.set("sectionBottom", expr);
  }

  createElement(): ElementBuilder {
    this.assertNotBuilt("createElement");

    const element = new ElementBuilder({
      parentModule: this.module_,
      viewFactory: this.viewFactory_,
    });
    this.elements_.push(element);
    return element;
  }

  createImageElement(): ImageElementBuilder {
    this.assertNotBuilt("createImageElement");

    const element = new ImageElementBuilder({
      parentModule: this.module_,
      viewFactory: this.viewFactory_,
    });
    this.elements_.push(element);
    return element;
  }

  public get moduleInstance(): Module {
    return this.module_;
  }

  /**
   * Finalizes section layout intent:
   * - Derives missing expressions (top / height / bottom)
   * - Registers all expressions with the module
   */
  finalize(): void {
    this.assertNotBuilt("finalize");

    this.validateAndDeriveLayout();
    this.registerExpressions();

    // Recursively finalize children
    this.elements_.forEach((el) => el.finalize());
  }

  // ─────────────────────────────────────────────────────────────
  // Build phase
  // ─────────────────────────────────────────────────────────────

  build(options: { parent: Presentation }): Section {
    this.assertNotBuilt("build");
    this.built_ = true;

    const { parent } = options;

    const section = new Section({
      name: this.name_,
      parent,
      sectionTop: this.get("sectionTop"),
      sectionHeight: this.get("sectionHeight"),
      sectionBottom: this.get("sectionBottom"),
      style: this.style_,
      elements: [],
      viewFactory: this.viewFactory_,
    });

    const builtElements = this.elements_.map((el) =>
      el.build({ parent: section }),
    );

    section._setElements(builtElements);

    return section;
  }

  // ─────────────────────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────────────────────

  private get(
    key: "sectionTop" | "sectionHeight" | "sectionBottom",
  ): Expression {
    const getter = this.getters_.get(key);
    if (!getter) {
      throw new Error(`SectionBuilder: Expression '${key}' not registered`);
    }
    return getter();
  }

  private validateAndDeriveLayout(): void {
    const hasHeight = this.expressions_.has("sectionHeight");
    const hasBottom = this.expressions_.has("sectionBottom");

    if (!hasHeight && !hasBottom) {
      throw new Error("Must specify either height or bottom");
    }

    // top is derived from previous section or zero
    if (this.prevSectionBuilder_) {
      this.expressions_.set("sectionTop", "prevSection.sectionBottom");
    } else {
      this.expressions_.set("sectionTop", "0");
    }

    // derive missing property
    if (!hasBottom) {
      this.expressions_.set("sectionBottom", "sectionTop + sectionHeight");
    } else if (!hasHeight) {
      this.expressions_.set("sectionHeight", "sectionBottom - sectionTop");
    }

    // Wire element adjacency
    // FIXME: have to use '!' here - we know the sections are defined, but TypeScript doesn't.
    for (let i = 0; i < this.elements_.length; i++) {
      if (i > 0) {
        this.elements_[i]!.setPrevious(this.elements_[i - 1]!);
      }

      if (i < this.elements_.length - 1) {
        this.elements_[i]!.setNext(this.elements_[i + 1]!);
      }
    }

    // Wire named elements
    const namedElements = this.module_.rootModule.addSubModule();
    this.elements_.forEach((el) => {
      if (el.getName().length === 0) {
        return;
      }

      namedElements.mapModule(el.getName(), el.moduleInstance);
    });
    this.module_.mapModule("elements", namedElements);
  }

  private registerExpressions(): void {
    const keys: Array<"sectionTop" | "sectionHeight" | "sectionBottom"> = [
      "sectionTop",
      "sectionHeight",
      "sectionBottom",
    ];

    for (const key of keys) {
      const expr = this.expressions_.get(key);
      if (!expr) {
        throw new Error(`Missing section expression: ${key}`);
      }

      const getter = this.module_.addExpression(key, expr);
      this.getters_.set(key, getter);
    }
  }

  private assertNotBuilt(method: string): void {
    if (this.built_) {
      throw new Error(
        `SectionBuilder.${method}: Builder is no longer usable after build()`,
      );
    }
  }
}
