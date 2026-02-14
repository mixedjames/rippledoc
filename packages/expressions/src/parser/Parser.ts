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

import { UnboundExpression } from "../expressions/UnboundExpression";

/**
 * Parse an expression string into an UnboundExpression.
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
    const root = this.parseAdditive();

    if (this.current_.type !== TokenType.EOF) {
      throw new Error(`Unexpected token at position ${this.current_.position}`);
    }

    return new UnboundExpression(root);
  }

  // ---------- Grammar ----------

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

  // unary → "-" unary | primary
  private parseUnary(): AstNode {
    if (this.current_.type === TokenType.MINUS) {
      const op = this.current_.type;
      this.advance();
      const operand = this.parseUnary();
      return new UnaryExpression(op, operand);
    }

    return this.parsePrimary();
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
      const expr = this.parseAdditive();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    throw new Error(
      `Expected number, identifier, or '(' at position ${this.current_.position}`,
    );
  }

  // ---------- Helpers ----------

  private advance(): void {
    this.current_ = this.lexer_.nextToken();
  }

  /**
   * Checks the current token type and advances.
   */
  private expect(type: TokenType): void {
    if (this.current_.type !== type) {
      throw new Error(
        `Expected ${type.toString()} at position ${this.current_.position}`,
      );
    }
    this.advance();
  }

  /**
   * Checks the current token type without advancing.
   */
  private expectAndStay(type: TokenType): void {
    if (this.current_.type !== type) {
      throw new Error(
        `Expected ${type.toString()} at position ${this.current_.position}`,
      );
    }
  }
}
