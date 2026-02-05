// UnboundExpression.js
//
// Wrapper around an unbound (symbolic) AST.
//
// Represents phase 1 of an expression's lifecycle.
// Owns the AST until bind(context) is called.
//
// After binding, ownership of the AST moves to a DependentExpression.
// This wrapper becomes inert, but retains a reference to the
// DependentExpression so other parts of the system may link to it.

import { DependentExpression } from "./DependentExpression.js";

export class UnboundExpression {

  // ---------- Fields ----------

  // Root AST node while unbound.
  // Set to null after binding (ownership transferred).
  #root;

  // The DependentExpression created by binding.
  // Remains available after jump-ship so others can link to it.
  #dependentExpression = null;

  // ---------- Construction ----------

  /**
   * Create a new UnboundExpression owning the given AST.
   *
   * @param {AstNode} root
   */
  constructor(root) {

    if (!root) {
      throw new Error("UnboundExpression requires non-null AST root");
    }

    this.#root = root;
  }

  // ---------- State ----------

  /**
   * Returns true if this expression has already been bound.
   */
  isBound() {
    return this.#dependentExpression !== null;
  }

  // ---------- Binding ----------

  /**
   * Bind this expression using the provided context.
   *
   * This performs:
   *   - AST.bind(context) to produce a bound AST
   *   - Creation of a DependentExpression owning that bound AST
   *   - Transfer ("jump ship") of AST ownership to DependentExpression
   *
   * After this call:
   *   - This UnboundExpression can no longer be used for binding
   *   - dependentExpression becomes available
   *
   * @param {Context} context
   * @returns {DependentExpression}
   */
  bind(context) {

    if (this.#root === null) {
      throw new Error("Expression already bound");
    }

    const boundAst = this.#root.bind(context);

    this.#dependentExpression =
      new DependentExpression(boundAst);

    // Jump ship: UnboundExpression no longer owns the AST
    this.#root = null;

    return this.#dependentExpression;
  }

  // ---------- Access ----------

  /**
   * Return the DependentExpression produced by binding.
   *
   * Only valid after bind() has been called.
   */
  get dependentExpression() {

    if (this.#dependentExpression === null) {
      throw new Error("Expression not yet bound");
    }

    return this.#dependentExpression;
  }

}
