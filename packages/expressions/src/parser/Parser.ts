// Parser.ts
//
// Recursive-ascent expression parser.
// Produces a single unbound AST wrapped in UnboundExpression.

import { TokenType } from "../lexer/Token";
import type { Token } from "../lexer/Token";
import { Lexer } from "../lexer/Lexer";

import {
  AstNode,
  NumberLiteral,
  UnaryExpression,
  BinaryExpression,
} from "./AST";
import { NameExpression } from "./AST.NameExpression";
import { FunctionExpression } from "./AST.FunctionExpression";

import { UnboundExpression } from "../expressions/UnboundExpression";

/**
 *
 */
export class BindingError extends Error {
  private readonly missingName_: string;

  constructor(missingName: string) {
    super(`Binding error: ${missingName} not found`);

    this.name = "SyntaxError";
    this.missingName_ = missingName;
  }

  get missingName(): string {
    return this.missingName_;
  }
}

/**
 * Custom error class for syntax errors encountered during parsing.
 * Includes the position in the input string where the error occurred.
 */
export class ExpressionsSyntaxError extends Error {
  private readonly position_: number;

  constructor(message: string, position: number) {
    super(`Syntax error at position ${position}: ${message}`);

    this.name = "ExpressionsSyntaxError";
    this.position_ = position;
  }

  get position(): number {
    return this.position_;
  }
}

/**
 * Parse an expression string into an UnboundExpression.
 *
 * Throws:
 *  - ExpressionsSyntaxError if the input string contains a syntax error. The error will include
 *    the position of the error in the input string.
 *  - The exact exception thrown for other failure modes is non-contractual however, it will be
 *    an Error or subclass of Error with a descriptive message.
 */
export function parseExpression(expressionString: string): UnboundExpression {
  const lexer = new Lexer(expressionString);
  const parser = new Parser(lexer);
  return parser.parseExpression();
}

class Parser {
  // ---------- Fields ----------

  private readonly lexer_: Lexer;
  private current_: Token;

  // ---------- Construction ----------

  constructor(lexer: Lexer) {
    // Defensive runtime check retained for now in case this
    // is ever called from untyped/JS code; consider removing
    // once all construction sites are strictly typed.
    if (!lexer) {
      throw new Error("Parser requires lexer");
    }

    this.lexer_ = lexer;
    this.current_ = lexer.nextToken();
  }

  // ---------- Public API ----------

  /**
   * Parse a full expression.
   */
  parseExpression(): UnboundExpression {
    const root = this.parseEquality();

    if (this.current_.type !== TokenType.EOF) {
      throw new ExpressionsSyntaxError(
        `Unexpected token`,
        this.current_.position,
      );
    }

    return new UnboundExpression(root);
  }

  // ---------- Grammar ----------

  // equality → relational ( ( "==" | "!=" ) relational )*
  private parseEquality(): AstNode {
    let left = this.parseRelational();

    while (
      this.current_.type === TokenType.EQEQ ||
      this.current_.type === TokenType.NEQ
    ) {
      const op = this.current_.type;
      this.advance();
      const right = this.parseRelational();
      left = new BinaryExpression(left, op, right);
    }

    return left;
  }

  // relational → additive ( ( "<" | ">" | "<=" | ">=" ) additive )*
  private parseRelational(): AstNode {
    let left = this.parseAdditive();

    while (
      this.current_.type === TokenType.LT ||
      this.current_.type === TokenType.GT ||
      this.current_.type === TokenType.LTE ||
      this.current_.type === TokenType.GTE
    ) {
      const op = this.current_.type;
      this.advance();
      const right = this.parseAdditive();
      left = new BinaryExpression(left, op, right);
    }

    return left;
  }

  // additive → multiplicative ( ( "+" | "-" ) multiplicative )*
  private parseAdditive(): AstNode {
    let left = this.parseMultiplicative();

    while (
      this.current_.type === TokenType.PLUS ||
      this.current_.type === TokenType.MINUS
    ) {
      const op = this.current_.type;
      this.advance();
      const right = this.parseMultiplicative();
      left = new BinaryExpression(left, op, right);
    }

    return left;
  }

  // multiplicative → unary ( ( "*" | "/" | "%" ) unary )*
  private parseMultiplicative(): AstNode {
    let left = this.parseUnary();

    while (
      this.current_.type === TokenType.STAR ||
      this.current_.type === TokenType.SLASH ||
      this.current_.type === TokenType.PERCENT
    ) {
      const op = this.current_.type;
      this.advance();
      const right = this.parseUnary();
      left = new BinaryExpression(left, op, right);
    }

    return left;
  }

  // unary → "-" unary | postfix
  private parseUnary(): AstNode {
    if (this.current_.type === TokenType.MINUS) {
      const op = this.current_.type;
      this.advance();
      const operand = this.parseUnary();
      return new UnaryExpression(op, operand);
    }

    return this.parsePostfix();
  }

  // postfix → primary ( "(" argumentList? ")" )*
  private parsePostfix(): AstNode {
    let expr = this.parsePrimary();

    // Function calls: f(), f(a, b)
    if (
      expr instanceof NameExpression &&
      this.current_.type === TokenType.LPAREN
    ) {
      expr = this.finishCall(expr);
    }

    return expr;
  }

  // primary → NUMBER
  //         | IDENTIFIER ("." IDENTIFIER)*
  //         | "(" additive ")"
  private parsePrimary(): AstNode {
    // Number
    if (this.current_.type === TokenType.NUMBER) {
      const value = this.current_.value;
      this.advance();
      return new NumberLiteral(value);
    }

    // Name / member access
    const token = this.current_;
    if (token.type === TokenType.IDENTIFIER) {
      const parts: string[] = [];
      parts.push(token.lexeme);
      this.advance();

      while (this.current_.type === TokenType.DOT) {
        this.advance();
        this.expectAndStay(TokenType.IDENTIFIER);
        parts.push(this.current_.lexeme);
        this.advance();
      }

      return new NameExpression(parts);
    }

    // Parenthesized
    if (this.current_.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseEquality();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    throw new ExpressionsSyntaxError(
      `Expected number, identifier, or '('`,
      this.current_.position,
    );
  }

  // argumentList → additive ( "," additive )*
  private finishCall(callee: NameExpression): AstNode {
    // We are currently at '('.
    this.advance();

    const args: AstNode[] = [];

    // Handle empty argument list: f()
    if (this.current_.type !== TokenType.RPAREN) {
      args.push(this.parseEquality());

      while (this.current_.type === TokenType.COMMA) {
        this.advance();
        args.push(this.parseEquality());
      }
    }

    this.expect(TokenType.RPAREN);

    return new FunctionExpression(callee.getParts(), args);
  }

  // ---------- Helpers ----------

  private advance(): void {
    this.current_ = this.lexer_.nextToken();
  }

  /**
   * Checks the current token type and advances.
   */
  private expect(type: TokenType): void {
    let unexpectedLexeme = this.current_.lexeme;
    if (this.current_.type == TokenType.EOF) {
      unexpectedLexeme = "end of input";
    }

    if (this.current_.type !== type) {
      throw new ExpressionsSyntaxError(
        `Unexpected '${unexpectedLexeme}'`,
        this.current_.position,
      );
    }

    this.advance();
  }

  /**
   * Checks the current token type without advancing.
   */
  private expectAndStay(type: TokenType): void {
    let unexpectedLexeme = this.current_.lexeme;
    if (this.current_.type == TokenType.EOF) {
      unexpectedLexeme = "end of input";
    }

    if (this.current_.type !== type) {
      throw new ExpressionsSyntaxError(
        `Unexpected '${unexpectedLexeme}'`,
        this.current_.position,
      );
    }
  }
}
