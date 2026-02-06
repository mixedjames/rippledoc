import { describe, it, expect } from "vitest";
import { Lexer } from "./Lexer";
import { TokenType } from "./Token";

describe("Lexer", () => {

  it("should tokenize numbers, identifiers, operators, and parentheses", () => {
    const source = "x = 42 + y * 3.14 - (z / 2) % 5 @";
    const lexer = new Lexer(source);

    const tokens = [];
    let token;
    do {
      token = lexer.nextToken();
      tokens.push(token);
    } while (token.type !== TokenType.EOF);

    const lexemes = tokens.map(t => t.lexeme);
    const types = tokens.map(t => t.type);

    expect(lexemes).toEqual([
      "x", "=", "42", "+", "y", "*", "3.14", "-", "(", "z", "/", "2", ")", "%", "5", "@", ""
    ]);

    expect(types).toEqual([
      TokenType.IDENTIFIER,
      TokenType.UNKNOWN, // '=' is unknown
      TokenType.NUMBER,
      TokenType.PLUS,
      TokenType.IDENTIFIER,
      TokenType.STAR,
      TokenType.NUMBER,
      TokenType.MINUS,
      TokenType.LPAREN,
      TokenType.IDENTIFIER,
      TokenType.SLASH,
      TokenType.NUMBER,
      TokenType.RPAREN,
      TokenType.PERCENT,
      TokenType.NUMBER,
      TokenType.UNKNOWN, // '@' is unknown
      TokenType.EOF
    ]);

    // Check numeric values
    const numberValues = tokens
      .filter(t => t.type === TokenType.NUMBER)
      .map(t => t.value);

    expect(numberValues).toEqual([42, 3.14, 2, 5]);
  });

  it("should skip whitespace", () => {
    const lexer = new Lexer("  \t\n 123 \r\n ");
    const token = lexer.nextToken();
    expect(token.type).toBe(TokenType.NUMBER);
    expect(token.value).toBe(123);
  });

  it("should return UNKNOWN for unexpected characters", () => {
    const lexer = new Lexer("@");
    const token = lexer.nextToken();
    expect(token.type).toBe(TokenType.UNKNOWN);
    expect(token.lexeme).toBe("@");
    expect(token.value).toBe(0);
  });

});
