import type { AstNode } from "../parser/AST";
import type { BindingContext } from "../parser/BindingContext";
import { UncheckedExpression } from "./UncheckedExpression";

/**
 * Wrapper around an unbound (symbolic) AST.
 *
 * Represents phase 1 of an expression's lifecycle and owns the
 * AST until bind(context) is called.
 */
export class UnboundExpression {
  // Root AST node while unbound. Set to null after binding.
  private root_: AstNode | null;

  // The UncheckedExpression created by binding.
  private dependentExpression_: UncheckedExpression | null = null;

  constructor(root: AstNode) {
    if (!root) {
      throw new Error("UnboundExpression requires non-null AST root");
    }
    this.root_ = root;
  }

  /**
   * Returns true if this expression has already been bound.
   */
  isBound(): boolean {
    return this.dependentExpression_ !== null;
  }

  /**
   * Bind this expression using the provided context.
   *
   * After this call, ownership of the AST moves to the
   * created DependentExpression and this wrapper becomes
   * inert, retaining only a reference to that dependent
   * expression.
   */
  bind(context: BindingContext): UncheckedExpression {
    if (this.root_ === null) {
      throw new Error("Expression already bound");
    }

    const boundAst = this.root_.bind(context);
    this.dependentExpression_ = new UncheckedExpression(boundAst);

    // Jump ship: UnboundExpression no longer owns the AST
    this.root_ = null;

    return this.dependentExpression_;
  }

  /**
   * Return the UncheckedExpression produced by binding.
   * Only valid after bind() has been called.
   */
  get dependentExpression(): UncheckedExpression {
    if (this.dependentExpression_ === null) {
      throw new Error("Expression not yet bound");
    }
    return this.dependentExpression_;
  }
}
