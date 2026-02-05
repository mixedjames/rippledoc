// DependentExpression.js
//
// Wrapper around a bound AST (phase 2).
//
// Owns the AST after binding.
// After resolve(), ownership of the AST moves to Expression and this
// wrapper becomes a lightweight handle to the resolved Expression.
//
// Lifecycle:
//   Bound AST  -> DependentExpression -> Expression
//
// IMPORTANT:
// Dependencies must NOT be discovered during construction.
// Some dependencies may not exist yet while other DependentExpressions
// are still being built. Therefore we lazily compute and cache
// dependencies on first use.
//
// IMPORTANT ARCHITECTURAL RULE:
//
// During construction and binding, the dependency graph does not yet exist.
// Therefore:
//
//  - No code in this phase may recursively walk dependencies.
//  - No code may call resolve() on other DependentExpressions.
//  - Dependencies are only inspected after all DependentExpressions
//    have been created.
//
// Violating this will produce subtle and catastrophic bugs.


import { Expression } from "./Expression.js";

export class DependentExpression {

  // ---------- Fields ----------

  // Bound AST while unresolved.
  // Set to null after resolve() (ownership transferred).
  #ast;

  // Cached dependency list (array of DependentExpression).
  // Initialized lazily.
  #dependencies = null;

  // Final resolved Expression (after resolve()).
  #expression = null;

  // ---------- Construction ----------

  /**
   * @param {AstNode} ast Bound AST
   */
  constructor(ast) {

    if (!ast) {
      throw new Error("DependentExpression requires AST");
    }

    this.#ast = ast;
  }

  // ---------- State ----------

  /**
   * Returns true if this expression has been resolved.
   */
  isResolved() {
    return this.#expression !== null;
  }

  // ---------- Dependency Inspection ----------

  /**
   * Return true if any dependency is not yet resolved.
   *
   * Dependencies are discovered lazily and cached on first call.
   *
   * DO NOT move dependency discovery into the constructor.
   * At construction time not all DependentExpressions may exist yet.
   */
  hasUnresolvedDependencies() {

    if (this.#dependencies === null) {
      this.#dependencies = this.#ast.getDependencies();
    }

    for (const d of this.#dependencies) {
      if (!d.isResolved()) {
        return true;
      }
    }

    return false;
  }

  // ---------- Resolution ----------

  /**
   * Resolve this expression into its final Expression form.
   *
   * All dependencies must already be resolved.
   *
   * Transfers AST ownership to Expression.
   */
  resolve() {

    if (this.#expression !== null) {
      throw new Error("Already resolved");
    }

    if (this.hasUnresolvedDependencies()) {
      throw new Error("Unresolved dependencies exist");
    }

    // Resolve AST nodes (phase 2 -> phase 3)
    const resolvedAst = this.#ast.resolve();

    // Create final Expression
    this.#expression = new Expression(resolvedAst);

    // Jump ship: DependentExpression no longer owns AST
    this.#ast = null;

    return this.#expression;
  }

  // ---------- Access ----------

  /**
   * Return the resolved Expression.
   *
   * Only valid after resolve().
   */
  get expression() {

    if (this.#expression === null) {
      throw new Error("Expression not resolved yet");
    }

    return this.#expression;
  }

}
