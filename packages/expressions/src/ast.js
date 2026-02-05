// ast.js
//
// Single AST hierarchy used for both unbound and bound expressions.
//
// Nodes are symbolic until bind(context) is called.
// After binding, nodes are concrete and evaluable.

import { TokenType } from "./Lexer.js";
import { NameType } from "./Parser.js";

/**
 * Base class for all AST nodes.
 * 
 * Important concept: phases of an expression's lifecycle
 *   1. Symbolic (unbound) phase
 *      An expression is abstract and any identifiers are symbolic names.
 *
 *   2. Bound (concrete) phase
 *      An expression has been bound to a context, and all names
 *      have been resolved to a specific context. References are replaced with
 *      link functions that will generate the dependent expression in a future phase.
 *
 *   3. Resolved phase
 *      An expression has been resolved to its final form, with all
 *      references replaced with the actual expressions they refer to.
 * 
 * Why does this matter here? Well, because each phase is represented to the client by
 * a different wrapper class:
 *   - UnboundExpression (phase 1)
 *   - DependentExpression (phase 2)
 *   - Expression (phase 3)
 * 
 * Each wrapper knows how to get to the next phase. Now I didn't want to write a bunch
 * of duplicate AST node classes for each phase, so instead we have a single AST node
 * hierarchy that can represent nodes in any phase.
 * 
 * The tree is passed from wrapper to wrapper as the expression moves through its lifecycle.
 * 
 * It does this by have each node implement a function for each phase transition - this function
 * returns a new node representing the next phase. Often the node is unchanged, but sometimes
 * it's replaced with a different node type.
 * 
 * My laziness means we have to be careful - most nodes are so-called multi-phase nodes that
 * don't care what phase they're in. But some nodes are phase-specific - for example:
 *   - NameExpression: only valid in phase 1 (symbolic)
 *   - LinkedNamedExpression: only valid in phase 2 (bound)
 *   - ResolvedNamedExpression: only valid in phase 3 (resolved)
 * 
 * Each node is written defensively to ensure it's only used in the correct phase.
 */
export class AstNode {

  /**
   * Bind this node using the provided context.
   * Default: node is already concrete.
   */
  bind(context) {
    return this;
  }

  /**
   * Evaluate this node.
   * Only valid after binding.
   */
  evaluate() {
    throw new Error("evaluate() not implemented");
  }

  /**
   * Return array of DependentExpression objects this node depends on.
   * Symbolic dependency discovery phase.
   */
  getDependencies() {
    return [];
  }

  /**
   * Resolve this node.
   */
  resolve() {
    return this;
  }
}

/**
 * Numeric literal.
 */
export class NumberLiteral extends AstNode {

  #value;

  constructor(value) {
    super();
    this.#value = value;
  }

  evaluate() {
    return this.#value;
  }
}

/**
 * Unary operator expression.
 */
export class UnaryExpression extends AstNode {

  #operator;
  #operand;

  constructor(operator, operand) {
    super();
    this.#operator = operator;
    this.#operand = operand;
  }

  bind(context) {
    this.#operand = this.#operand.bind(context);
    return this;
  }

  resolve() {
    this.#operand = this.#operand.resolve();
    return this;
  }

  evaluate() {
    const v = this.#operand.evaluate();

    switch (this.#operator) {
      case TokenType.MINUS:
        return -v;
      default:
        throw new Error("Unsupported unary operator");
    }
  }

  getDependencies() {
    return this.#operand.getDependencies();
  }
}

/**
 * Binary operator expression.
 */
export class BinaryExpression extends AstNode {

  #left;
  #operator;
  #right;

  constructor(left, operator, right) {
    super();
    this.#left = left;
    this.#operator = operator;
    this.#right = right;
  }

  bind(context) {
    this.#left = this.#left.bind(context);
    this.#right = this.#right.bind(context);
    return this;
  }

  resolve() {
    this.#left = this.#left.resolve();
    this.#right = this.#right.resolve();
    return this;
  }

  evaluate() {
    const l = this.#left.evaluate();
    const r = this.#right.evaluate();

    switch (this.#operator) {
      case TokenType.PLUS:    return l + r;
      case TokenType.MINUS:   return l - r;
      case TokenType.STAR:    return l * r;
      case TokenType.SLASH:   return l / r;
      case TokenType.PERCENT:return l % r;
      default:
        throw new Error("Unsupported operator");
    }
  }

  getDependencies() {
    return [
      ...this.#left.getDependencies(),
      ...this.#right.getDependencies()
    ];
  }
}

/**
 * Symbolic name reference.
 *
 * Examples:
 *   x
 *   a.b
 *   a.b.c
 */
export class NameExpression extends AstNode {

  #parts; // array of strings

  constructor(parts) {
    super();
    this.#parts = parts;
  }

  getParts() {
    return this.#parts;
  }

  /**
   * Symbolic dependency:
   * the first name determines which expression we depend on.
   */
  getDependencies() {
    throw new Error("Unbound NameExpression cannot get dependencies");
  }

  bind(context) {
    return new LinkedNamedExpression(
      context.lookupName(this.#parts, NameType.VALUE)
    );
  }
}

class LinkedNamedExpression extends AstNode {

  #link;
  #dependentExpression = null;

  constructor(link) {
    super();

    if (!link) {
      throw new Error("LinkedNamedExpression requires a valid link");
    }
    
    this.#link = link;
  }

  getDependencies() {
    this.#ensureLink();
    return [this.#dependentExpression];
  }

  bind(context) {
    throw new Error("LinkedNamedExpression cannot be rebound");
  }

  resolve() {
    this.#ensureLink();
    return new ResolvedNamedExpression(this.#dependentExpression.expression);
  }

  #ensureLink() {
    if (this.#dependentExpression === null) {
      this.#dependentExpression = this.#link();
    }
  }

}

class ResolvedNamedExpression extends AstNode {

  #expression;

  constructor(expression) {
    super();
    this.#expression = expression;
  }

  bind(context) {
    throw new Error("ResolvedNamedExpression cannot be rebound");
  }

  resolve() {
    throw new Error("ResolvedNamedExpression is already resolved");
  }

  getDependencies() {
    throw new Error(" ResolvedNamedExpression cannot get dependencies");
  }

  evaluate() {
    return this.#expression.evaluate();
  }

}