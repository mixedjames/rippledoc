/**
 * Enumerates all token kinds produced by the lexer.
 */
export enum TokenType {

  /** Numeric literal (e.g. 123, 3.14) */
  NUMBER,

  /** Identifier (e.g. variable names) */
  IDENTIFIER,

  /** '+' */
  PLUS,

  /** '-' */
  MINUS,

  /** '*' */
  STAR,

  /** '/' */
  SLASH,

  /** '%' */
  PERCENT,

  /** '.' */
  DOT,

  /** '(' */
  LPAREN,

  /** ')' */
  RPAREN,

  /** End-of-file marker */
  EOF,

  /** Any character not recognized by the lexer */
  UNKNOWN
}

/**
 * Represents a single lexical token.
 */
export interface Token {

  /** Kind of token */
  type: TokenType;

  /** Raw text as it appears in the source */
  lexeme: string;

  /** Starting character index in the source */
  position: number;

  /**
   * Numeric value of the token.
   * For NUMBER tokens, this is the parsed value.
   * For all other tokens, this is 0.
   */
  value: number;
}
