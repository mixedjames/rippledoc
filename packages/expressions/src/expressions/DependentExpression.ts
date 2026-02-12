import type { AstNode } from "../parser/AST";
import { Expression } from "./Expression";

/**
 * Wrapper around a bound AST (phase 2).
 *
 * Owns the AST after binding. After resolve(), ownership of
 * the AST moves to Expression and this wrapper becomes a
 * lightweight handle to the resolved Expression.
 */
export class DependentExpression {
  // Bound AST while unresolved. Set to null after resolve().
  private ast_: AstNode | null;

  // Cached dependency list, initialized lazily.
  private dependencies_: DependentExpression[] | null = null;

  // Final resolved Expression (after resolve()).
  private expression_: Expression | null = null;

  constructor(ast: AstNode) {
    if (!ast) {
      throw new Error("DependentExpression requires AST");
    }
    this.ast_ = ast;
  }

  /**
   * Returns true if this expression has been resolved.
   */
  isResolved(): boolean {
    return this.expression_ !== null;
  }

  /**
   * Return true if any dependency is not yet resolved.
   *
   * Dependencies are discovered lazily and cached on first call.
   */
  hasUnresolvedDependencies(): boolean {
    if (this.dependencies_ === null) {
      if (!this.ast_) {
        throw new Error("AST not available for dependency discovery");
      }
      this.dependencies_ = this.ast_.getDependencies();
    }

    for (const d of this.dependencies_) {
      if (!d.isResolved()) {
        return true;
      }
    }

    return false;
  }

  /**
   * Resolve this expression into its final Expression form.
   * All dependencies must already be resolved.
   */
  resolve(): Expression {
    if (this.expression_ !== null) {
      throw new Error("Already resolved");
    }

    if (this.hasUnresolvedDependencies()) {
      throw new Error("Unresolved dependencies exist");
    }

    if (!this.ast_) {
      throw new Error("AST not available for resolution");
    }

    // Resolve AST nodes (phase 2 -> phase 3)
    const resolvedAst = this.ast_.resolve();
    this.expression_ = new Expression(resolvedAst);

    // Jump ship: DependentExpression no longer owns AST
    this.ast_ = null;

    return this.expression_;
  }

  /**
   * Return the resolved Expression. Only valid after resolve().
   */
  get expression(): Expression {
    if (this.expression_ === null) {
      throw new Error("Expression not resolved yet");
    }
    return this.expression_;
  }
}
