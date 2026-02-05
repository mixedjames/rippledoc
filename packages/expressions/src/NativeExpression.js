// NativeExpression.js
//
// Provides a bridge between native JavaScript functions and the expression system.
//
// Native functions have no dependencies on other expressions and simply
// delegate evaluation to a provided JavaScript function.

import { UnboundExpression } from "./UnboundExpression.js";

/**
 * AST node that wraps a native JavaScript function.
 * 
 * Participates in the standard expression lifecycle but skips
 * dependency tracking and symbolic binding.
 */
class NativeFunctionNode {

  #nativeFn;

  /**
   * Create a new native function node.
   * 
   * @param {function} nativeFn - The JavaScript function to call during evaluation
   */
  constructor(nativeFn) {
    if (typeof nativeFn !== "function") {
      throw new Error("NativeFunctionNode requires a function");
    }
    this.#nativeFn = nativeFn;
  }

  /**
   * Bind operation is a no-op for native functions.
   * Returns self since there's nothing to bind.
   * 
   * @param {BindingContext} context - Unused
   * @returns {NativeFunctionNode} self
   */
  bind(context) {
    return this;
  }

  /**
   * Resolve operation is a no-op for native functions.
   * Returns self since there's nothing to resolve.
   * 
   * @returns {NativeFunctionNode} self
   */
  resolve() {
    return this;
  }

  /**
   * Has no dependencies, thus always returns false.
   * @returns 
   */
  hasUnresolvedDependencies() {
    return false;
  }

  /**
   * Native functions have no dependencies.
   * 
   * @returns {Array} Empty array
   */
  getDependencies() {
    return [];
  }

  /**
   * Evaluate by calling the native function.
   * 
   * @returns {*} Result of the native function
   */
  evaluate() {
    return this.#nativeFn();
  }
}

/**
 * Create an UnboundExpression that wraps a native JavaScript function.
 * 
 * The returned expression participates in the standard expression lifecycle
 * (bind → resolve → evaluate) but delegates evaluation to the provided function.
 * 
 * Native expressions have no dependencies on other expressions.
 * 
 * @param {function} nativeFn - JavaScript function to call during evaluation
 * @returns {UnboundExpression} Expression wrapping the native function
 */
export function createNativeExpression(nativeFn) {
  const astNode = new NativeFunctionNode(nativeFn);
  return new UnboundExpression(astNode);
}
