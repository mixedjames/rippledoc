// Parser.js
//
// Recursive-ascent expression parser.
// Produces a single unbound AST wrapped in UnboundExpression.

import { TokenType, Lexer } from "./Lexer.js";

import {
  NumberLiteral,
  UnaryExpression,
  BinaryExpression,
  NameExpression
} from "./ast.js";

import { UnboundExpression } from "./UnboundExpression.js";

export const NameType = Object.freeze({
  VALUE:     Symbol("VALUE"),
  ARRAY:     Symbol("ARRAY"),
  FUNCTION:  Symbol("FUNCTION"),
});


export function parseExpression(expressionString) {
  const lexer = new Lexer(expressionString);
  const parser = new Parser(lexer);
  return parser.parseExpression();
}

export class Parser {

  // ---------- Fields ----------

  #lexer;
  #current;

  // ---------- Construction ----------

  constructor(lexer) {
    if (!lexer) {
      throw new Error("Parser requires lexer");
    }

    this.#lexer = lexer;
    this.#current = lexer.nextToken();
  }

  // ---------- Public API ----------

  /**
   * Parse a full expression.
   *
   * @returns {UnboundExpression}
   */
  parseExpression() {

    const root = this.#parseAdditive();

    if (this.#current.type !== TokenType.EOF) {
      throw new Error(
        `Unexpected token at position ${this.#current.position}`
      );
    }

    return new UnboundExpression(root);
  }

  // ---------- Grammar ----------

  // additive → multiplicative ( ( "+" | "-" ) multiplicative )*
  #parseAdditive() {

    let left = this.#parseMultiplicative();

    while (
      this.#current.type === TokenType.PLUS ||
      this.#current.type === TokenType.MINUS
    ) {
      const op = this.#current.type;
      this.#advance();
      const right = this.#parseMultiplicative();
      left = new BinaryExpression(left, op, right);
    }

    return left;
  }

  // multiplicative → unary ( ( "*" | "/" | "%" ) unary )*
  #parseMultiplicative() {

    let left = this.#parseUnary();

    while (
      this.#current.type === TokenType.STAR ||
      this.#current.type === TokenType.SLASH ||
      this.#current.type === TokenType.PERCENT
    ) {
      const op = this.#current.type;
      this.#advance();
      const right = this.#parseUnary();
      left = new BinaryExpression(left, op, right);
    }

    return left;
  }

  // unary → "-" unary | primary
  #parseUnary() {

    if (this.#current.type === TokenType.MINUS) {
      const op = this.#current.type;
      this.#advance();
      const operand = this.#parseUnary();
      return new UnaryExpression(op, operand);
    }

    return this.#parsePrimary();
  }

  // primary → NUMBER
  //         | IDENTIFIER ("." IDENTIFIER)*
  //         | "(" additive ")"
  #parsePrimary() {

    // Number
    if (this.#current.type === TokenType.NUMBER) {
      const value = this.#current.value;
      this.#advance();
      return new NumberLiteral(value);
    }

    // Name / member access
    if (this.#current.type === TokenType.IDENTIFIER) {

      const parts = [];
      parts.push(this.#current.lexeme);
      this.#advance();

      while (this.#current.type === TokenType.DOT) {
        this.#advance();
        this.#expectAndStay(TokenType.IDENTIFIER);
        parts.push(this.#current.lexeme);
        this.#advance();
      }

      return new NameExpression(parts);
    }

    // Parenthesized
    if (this.#current.type === TokenType.LPAREN) {
      this.#advance();
      const expr = this.#parseAdditive();
      this.#expect(TokenType.RPAREN);
      return expr;
    }

    throw new Error(
      `Expected number, identifier, or '(' at position ${this.#current.position}`
    );
  }

  // ---------- Helpers ----------

  #advance() {
    this.#current = this.#lexer.nextToken();
  }

  /**
   * Checks the current token type and advances.
   * @param {*} type 
   */
  #expect(type) {
    if (this.#current.type !== type) {
      throw new Error(
        `Expected ${type.toString()} at position ${this.#current.position}`
      );
    }
    this.#advance();
  }

  /**
   * Checks the current token type without advancing.
   * @param {*} type 
   */
  #expectAndStay(type) {
    if (this.#current.type !== type) {
      throw new Error(
        `Expected ${type.toString()} at position ${this.#current.position}`
      );
    }
  }
}
