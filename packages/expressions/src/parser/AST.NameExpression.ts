import type { BindingContext } from "./BindingContext";
import type { UncheckedExpression } from "../expressions/UncheckedExpression";
import type { Expression } from "../expressions/Expression";
import { AstNode } from "./AST";
import { NameType } from "./NameType";

/**
 * Symbolic name reference.
 *
 * Examples:
 *   x
 *   a.b
 *   a.b.c
 *
 * Represents phase 1 - binding.
 *
 * Because of this, the only valid thing to do with a NameExpression is to bind it exactly once.
 * This will cause it to be replaced with a LinkedNameExpression.
 */
export class NameExpression extends AstNode {
  // Sequence of name parts, e.g. ["a", "b", "c"] for a.b.c
  private readonly parts_: string[];

  constructor(parts: string[]) {
    // Type assertion on AstNode constructor above satisfies TS while
    // preserving the runtime shape of the AstNode base class.
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
  override getDependencies(): UncheckedExpression[] {
    throw new Error("Unbound NameExpression cannot get dependencies");
  }

  override bind(context: BindingContext): AstNode {
    return new LinkedNameExpression(
      context.lookupName(this.parts_, NameType.VALUE),
    );
  }
}

class LinkedNameExpression extends AstNode {
  // Link function: () => UncheckedExpression
  private readonly link_: () => UncheckedExpression;
  private linkedExpression_: UncheckedExpression | null = null;

  constructor(link: () => UncheckedExpression) {
    super();

    if (!link) {
      throw new Error("LinkedNameExpression requires a valid link");
    }

    this.link_ = link;
  }

  override getDependencies(): UncheckedExpression[] {
    this.ensureLink();
    return [this.linkedExpression_!];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("LinkedNameExpression cannot be rebound");
  }

  override resolve(): AstNode {
    this.ensureLink();
    return new ResolvedNameExpression(this.linkedExpression_!.expression);
  }

  private ensureLink(): void {
    if (this.linkedExpression_ === null) {
      this.linkedExpression_ = this.link_();
    }
  }
}

class ResolvedNameExpression extends AstNode {
  private readonly expression_: Expression;

  constructor(expression: Expression) {
    super();
    this.expression_ = expression;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override bind(_context: BindingContext): AstNode {
    throw new Error("ResolvedNameExpression cannot be rebound");
  }

  override resolve(): AstNode {
    throw new Error("ResolvedNameExpression is already resolved");
  }

  override getDependencies(): UncheckedExpression[] {
    throw new Error("ResolvedNameExpression cannot get dependencies");
  }

  override evaluate(): number {
    return this.expression_.evaluate();
  }
}
