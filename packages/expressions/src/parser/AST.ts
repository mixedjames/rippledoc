import type { BindingContext } from "./BindingContext";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";
import { TokenType } from "../lexer/Token";

/**
 * Base class for all AST nodes.
 *
 * Expression nodes move through several conceptual phases:
 *   1. Symbolic (unbound)  - names are just identifiers
 *   2. Bound (concrete)    - names are linked to a binding context
 *   3. Resolved            - all references are replaced with final expressions
 *
 * The same node hierarchy is reused across phases; each node
 * implements phase-transition methods that either return itself
 * unchanged or return a new node in the next phase.
 * 
 * This model explains the slightly bizarre lookupName interface which returns a link function
 * instead of a direct reference. We want to bind to an UncheckedExpression but during a call
 * to bind, not all expressions will have yet run so an UncheckedExpression may not yet exist for a
 * given name.
 * 
 * The link function is then called during the resolve() call when all expressions in a system
 * are guarenteed to have been converted to an UncheckedExpression and can be safely referenced.
 * 
 */
export abstract class AstNode {

  /**
   * Evaluate this node.
   * Only valid after binding and resolution.
   *
   * Subclasses are expected to override this; the base
   * implementation simply signals misuse.
   */
  evaluate(): number {
    throw new Error("evaluate() not implemented");
  }

  /**
   * Return array of dependent expressions this node depends on.
   * Symbolic dependency discovery phase.
   *
   * By default, nodes have no dependencies.
   */
  getDependencies(): UncheckedExpression[] {
    return [];
  }

  /**
   * Bind this node using the provided context.
   * Default implementation: node is already concrete.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bind(context: BindingContext): AstNode {
    return this;
  }

  /**
   * Resolve this node to its final form.
   * Default implementation: already resolved.
   */
  resolve(): AstNode {
    return this;
  }
}

/**
 * Numeric literal.
 */
export class NumberLiteral extends AstNode {
  private readonly value_: number;

  constructor(value: number) {
    super();
    this.value_ = value;
  }

  override evaluate(): number {
    return this.value_;
  }
}

/**
 * Unary operator expression.
 */
export class UnaryExpression extends AstNode {
  private readonly operator_: TokenType;
  private operand_: AstNode;

  constructor(operator: TokenType, operand: AstNode) {
    super();
    this.operator_ = operator;
    this.operand_ = operand;
  }

  override bind(context: BindingContext): AstNode {
    this.operand_ = this.operand_.bind(context);
    return this;
  }

  override resolve(): AstNode {
    this.operand_ = this.operand_.resolve();
    return this;
  }

  override evaluate(): number {
    const v = this.operand_.evaluate();

    switch (this.operator_) {
      case TokenType.MINUS:
        return -v;
      default:
        throw new Error("Unsupported unary operator");
    }
  }

  override getDependencies(): UncheckedExpression[] {
    return this.operand_.getDependencies();
  }
}

/**
 * Binary operator expression.
 */
export class BinaryExpression extends AstNode {
  private left_: AstNode;
  private readonly operator_: TokenType;
  private right_: AstNode;

  constructor(left: AstNode, operator: TokenType, right: AstNode) {
    super();
    this.left_ = left;
    this.operator_ = operator;
    this.right_ = right;
  }

  override bind(context: BindingContext): AstNode {
    this.left_ = this.left_.bind(context);
    this.right_ = this.right_.bind(context);
    return this;
  }

  override resolve(): AstNode {
    this.left_ = this.left_.resolve();
    this.right_ = this.right_.resolve();
    return this;
  }

  override evaluate(): number {
    const l = this.left_.evaluate();
    const r = this.right_.evaluate();

    switch (this.operator_) {
      case TokenType.PLUS:
        return l + r;
      case TokenType.MINUS:
        return l - r;
      case TokenType.STAR:
        return l * r;
      case TokenType.SLASH:
        return l / r;
      case TokenType.PERCENT:
        return l % r;
      default:
        throw new Error("Unsupported operator");
    }
  }

  override getDependencies(): UncheckedExpression[] {
    return [...this.left_.getDependencies(), ...this.right_.getDependencies()];
  }
}

