import { Token, TokenType } from "./Token";

/**
 * Simple streaming lexer for an expression grammar.
 * Converts source text into a stream of tokens.
 */
export class Lexer {
  /** Source text to lex */
  private source_: string;

  /** Current scanning position */
  private pos_: number;

  /**
   * Creates a new lexer for the given source text.
   * @param source The source string to tokenize.
   */
  constructor(source: string) {
    this.source_ = source;
    this.pos_ = 0;
  }

  /**
   * Returns the next token in the input stream.
   * Always returns a token; EOF token marks end-of-input.
   */
  public nextToken(): Token {
    this.skipWhitespace();

    if (this.pos_ >= this.source_.length) {
      return {
        type: TokenType.EOF,
        lexeme: "",
        position: this.pos_,
        value: 0,
      };
    }

    const c: string = this.source_[this.pos_] ?? "\0";

    if (this.isDigit(c)) {
      return this.number();
    }

    if (this.isAlpha(c)) {
      return this.identifier();
    }

    switch (c) {
      case "+":
        return this.single(TokenType.PLUS);
      case "-":
        return this.single(TokenType.MINUS);
      case "*":
        return this.single(TokenType.STAR);
      case "/":
        return this.single(TokenType.SLASH);
      case "%":
        return this.single(TokenType.PERCENT);
      case ".":
        return this.single(TokenType.DOT);
      case "(":
        return this.single(TokenType.LPAREN);
      case ")":
        return this.single(TokenType.RPAREN);
    }

    // Unknown character
    const start: number = this.pos_;
    const lexeme: string = this.source_[this.pos_++] ?? "\0";

    return {
      type: TokenType.UNKNOWN,
      lexeme,
      position: start,
      value: 0,
    };
  }

  // ---------------- Helper Methods ----------------

  /**
   * Creates a single-character token.
   * @param type The token type.
   * @returns A Token object with value 0.
   */
  private single(type: TokenType): Token {
    const start: number = this.pos_;
    const ch: string = this.source_[this.pos_] ?? "\0";
    this.pos_++;

    return {
      type,
      lexeme: ch,
      position: start,
      value: 0,
    };
  }

  /**
   * Skips over whitespace characters: space, tab, newline, carriage return.
   */
  private skipWhitespace(): void {
    while (this.pos_ < this.source_.length) {
      const c: string = this.source_[this.pos_] ?? "\0";
      if (c === " " || c === "\t" || c === "\n" || c === "\r") {
        this.pos_++;
      } else {
        break;
      }
    }
  }

  /**
   * Peeks at the current character without advancing the position.
   * @returns Current character or '\0' if at end-of-input.
   */
  private peek(): string {
    return this.source_[this.pos_] ?? "\0";
  }

  /**
   * Peeks at the next character without advancing the position.
   * @returns Next character or '\0' if at end-of-input.
   */
  private peekNext(): string {
    return this.source_[this.pos_ + 1] ?? "\0";
  }

  /**
   * Checks if the character is a digit (0-9).
   * @param c Character to check.
   */
  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  /**
   * Checks if the character is an alphabetic letter (a-z, A-Z).
   * @param c Character to check.
   */
  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
  }

  /**
   * Checks if the character is alphanumeric (a-z, A-Z, 0-9, or underscore).
   * @param c Character to check.
   */
  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c) || c === "_";
  }

  /**
   * Scans a number literal (integer or decimal).
   * @returns NUMBER token with parsed value.
   */
  private number(): Token {
    const start: number = this.pos_;

    // Integer part
    while (this.isDigit(this.peek())) {
      this.pos_++;
    }

    // Optional fractional part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.pos_++; // consume '.'
      while (this.isDigit(this.peek())) {
        this.pos_++;
      }
    }

    const lexeme: string = this.source_.slice(start, this.pos_);
    const value: number = Number(lexeme);

    return {
      type: TokenType.NUMBER,
      lexeme,
      position: start,
      value,
    };
  }

  /**
   * Scans an identifier (letters, digits, underscores).
   * @returns IDENTIFIER token with value 0.
   */
  private identifier(): Token {
    const start: number = this.pos_;

    while (this.isAlphaNumeric(this.peek())) {
      this.pos_++;
    }

    const lexeme: string = this.source_.slice(start, this.pos_);

    return {
      type: TokenType.IDENTIFIER,
      lexeme,
      position: start,
      value: 0,
    };
  }
}
