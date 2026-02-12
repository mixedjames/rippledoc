import type { BindingContext } from "./BindingContext";
import type { DependentExpression } from "../expressions/DependentExpression";
import type { Expression } from "../expressions/Expression";
import { TokenType } from "../lexer/Token";
import { NameType } from "./NameType";

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
 */
export abstract class AstNode {
  /**
   * Bind this node using the provided context.
   * Default implementation: node is already concrete.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bind(context: BindingContext): AstNode {
    return this;
  }

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
  getDependencies(): DependentExpression[] {
    return [];
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

  override getDependencies(): DependentExpression[] {
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

  override getDependencies(): DependentExpression[] {
    return [...this.left_.getDependencies(), ...this.right_.getDependencies()];
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
  // Sequence of name parts, e.g. ["a", "b", "c"] for a.b.c
  private readonly parts_: string[];

  constructor(parts: string[]) {
    super();
    this.parts_ = parts;
  }

  getParts(): string[] {
    return this.parts_;
  }

  /**
   * Symbolic dependency: the first name determines which
   * expression we depend on.
   */
  override getDependencies(): DependentExpression[] {
    throw new Error("Unbound NameExpression cannot get dependencies");
  }

  override bind(context: BindingContext): AstNode {
    return new LinkedNamedExpression(
      context.lookupName(this.parts_, NameType.VALUE),
    );
  }
}

class LinkedNamedExpression extends AstNode {
  // Link function: () => DependentExpression
  private readonly link_: () => DependentExpression;
  private dependentExpression_: DependentExpression | null = null;

  constructor(link: () => DependentExpression) {
    super();

    if (!link) {
      throw new Error("LinkedNamedExpression requires a valid link");
    }

    this.link_ = link;
  }

  override getDependencies(): DependentExpression[] {
    this.ensureLink();
    return [this.dependentExpression_!];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("LinkedNamedExpression cannot be rebound");
  }

  override resolve(): AstNode {
    this.ensureLink();
    return new ResolvedNamedExpression(this.dependentExpression_!.expression);
  }

  private ensureLink(): void {
    if (this.dependentExpression_ === null) {
      this.dependentExpression_ = this.link_();
    }
  }
}

class ResolvedNamedExpression extends AstNode {
  private readonly expression_: Expression;

  constructor(expression: Expression) {
    super();
    this.expression_ = expression;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("ResolvedNamedExpression cannot be rebound");
  }

  override resolve(): AstNode {
    throw new Error("ResolvedNamedExpression is already resolved");
  }

  override getDependencies(): DependentExpression[] {
    throw new Error(" ResolvedNamedExpression cannot get dependencies");
  }

  override evaluate(): number {
    return this.expression_.evaluate();
  }
}
