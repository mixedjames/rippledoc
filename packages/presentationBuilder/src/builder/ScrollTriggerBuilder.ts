import { Module } from "@rippledoc/expressions";
import type { Expression } from "@rippledoc/expressions";

import type { Presentation } from "@rippledoc/presentation";
import { ScrollTrigger } from "@rippledoc/presentation";

type TriggerKey = "start" | "end";

/**
 * Builder for a ScrollTrigger associated with a Presentation, Section, or Element.
 *
 * Responsibilities:
 * - Collect start/end expressions as strings
 * - Keep expressions scoped to the owning object's module via a private submodule
 * - Register expressions with the module and expose bound Expression getters
 * - Build an immutable ScrollTrigger instance
 */
export class ScrollTriggerBuilder {
  private readonly module_: Module;

  private readonly expressions_ = new Map<TriggerKey, string>();
  private readonly getters_ = new Map<TriggerKey, () => Expression>();

  private startViewOffset_ = 0;
  private endViewOffset_ = 0;

  private built_ = false;

  constructor(options: { parentModule: Module }) {
    const { parentModule } = options;
    this.module_ = parentModule.addSubModule();
  }

  // ─────────────────────────────────────────────────────────────
  // Construction-phase API
  // ─────────────────────────────────────────────────────────────

  /**
   * Set the start expression for this trigger.
   */
  setStart(expr: string): void {
    this.setExpression("start", expr);
  }

  /**
   * Set the end expression for this trigger.
   */
  setEnd(expr: string): void {
    this.setExpression("end", expr);
  }

  /**
   * Set the fractional viewport offset applied to the start expression.
   *
   * For example, an offset of 0.5 shifts the trigger by half the viewport height.
   */
  setStartViewOffset(offset: number): void {
    this.assertNotBuilt("setStartViewOffset");
    this.startViewOffset_ = offset;
  }

  /**
   * Set the fractional viewport offset applied to the end expression.
   */
  setEndViewOffset(offset: number): void {
    this.assertNotBuilt("setEndViewOffset");
    this.endViewOffset_ = offset;
  }

  /**
   * Expose the underlying module instance, primarily for wiring under
   * other modules if needed. Caller code should not map this module in a
   * way that exposes its expressions as public API.
   */
  get moduleInstance(): Module {
    return this.module_;
  }

  /**
   * Finalize trigger expressions and register them with the module.
   * Must be called before the owning module is compiled.
   */
  finalize(): void {
    this.assertNotBuilt("finalize");
    this.registerExpressions();
  }

  // ─────────────────────────────────────────────────────────────
  // Build phase
  // ─────────────────────────────────────────────────────────────

  build(options: { presentation: Presentation }): ScrollTrigger {
    this.assertNotBuilt("build");
    this.built_ = true;

    const { presentation } = options;

    return new ScrollTrigger({
      presentation,
      start: this.get("start"),
      startViewOffset: this.startViewOffset_,
      end: this.get("end"),
      endViewOffset: this.endViewOffset_,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────────────────────

  private setExpression(key: TriggerKey, expr: string): void {
    this.assertNotBuilt("setExpression");

    if (!expr || typeof expr !== "string") {
      throw new Error(`ScrollTriggerBuilder: Invalid expression for ${key}`);
    }

    this.expressions_.set(key, expr);
  }

  private get(key: TriggerKey): Expression {
    const getter = this.getters_.get(key);
    if (!getter) {
      throw new Error(
        `ScrollTriggerBuilder: Expression '${key}' not registered`,
      );
    }
    return getter();
  }

  private registerExpressions(): void {
    const keys: TriggerKey[] = ["start", "end"];

    for (const key of keys) {
      const expr = this.expressions_.get(key);
      if (!expr) {
        throw new Error(`ScrollTriggerBuilder: Missing expression '${key}'`);
      }

      const offset =
        key === "start" ? this.startViewOffset_ : this.endViewOffset_;
      const finalExpr = this.buildOffsetExpression(expr, offset);

      const getter = this.module_.addExpression(key, finalExpr);
      this.getters_.set(key, getter);
    }
  }

  /**
   * Build the expression that encodes any viewport-height-based offset.
   *
   * When offset is zero, the original expression is used as-is. Otherwise
   * we generate an expression of the form:
   *   (expr) - offset * viewportHeight
   * which relies on the root module providing a `viewportHeight` expression.
   */
  private buildOffsetExpression(expr: string, offset: number): string {
    if (!offset) {
      return expr;
    }

    return `(${expr}) - ${offset} * viewportHeight`;
  }

  private assertNotBuilt(method: string): void {
    if (this.built_) {
      throw new Error(
        `ScrollTriggerBuilder.${method}: Builder is no longer usable after build()`,
      );
    }
  }
}
