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
  private ast: AstNode | null;

  // Cached dependency list, initialized lazily.
  private dependencies: DependentExpression[] | null = null;

  // Final resolved Expression (after resolve()).
  private _expression: Expression | null = null;

  constructor(ast: AstNode) {
    if (!ast) {
      throw new Error("DependentExpression requires AST");
    }
    this.ast = ast;
  }

  /**
   * Returns true if this expression has been resolved.
   */
  isResolved(): boolean {
    return this._expression !== null;
  }

  /**
   * Return true if any dependency is not yet resolved.
   *
   * Dependencies are discovered lazily and cached on first call.
   */
  hasUnresolvedDependencies(): boolean {
    if (this.dependencies === null) {
      if (!this.ast) {
        throw new Error("AST not available for dependency discovery");
      }
      this.dependencies = this.ast.getDependencies();
    }

    for (const d of this.dependencies) {
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
    if (this._expression !== null) {
      throw new Error("Already resolved");
    }

    if (this.hasUnresolvedDependencies()) {
      throw new Error("Unresolved dependencies exist");
    }

    if (!this.ast) {
      throw new Error("AST not available for resolution");
    }

    // Resolve AST nodes (phase 2 -> phase 3)
    const resolvedAst = this.ast.resolve();
    this._expression = new Expression(resolvedAst);

    // Jump ship: DependentExpression no longer owns AST
    this.ast = null;

    return this._expression;
  }

  /**
   * Return the resolved Expression. Only valid after resolve().
   */
  get expression(): Expression {
    if (this._expression === null) {
      throw new Error("Expression not resolved yet");
    }
    return this._expression;
  }
}
