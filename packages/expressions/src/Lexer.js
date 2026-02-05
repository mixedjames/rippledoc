// Lexer.js
//
// Simple streaming lexer for expression grammar.
// Converts source text into a stream of tokens.

export const TokenType = Object.freeze({
  NUMBER:     Symbol("NUMBER"),
  IDENTIFIER: Symbol("IDENTIFIER"),

  PLUS:    Symbol("+"),
  MINUS:   Symbol("-"),
  STAR:    Symbol("*"),
  SLASH:   Symbol("/"),
  PERCENT: Symbol("%"),
  DOT:     Symbol("."),
  LPAREN:  Symbol("("),
  RPAREN:  Symbol(")"),

  EOF: Symbol("EOF")
});

export class Lexer {

  // ---------- Fields ----------

  #source;
  #length;
  #pos;

  // ---------- Construction ----------

  constructor(source) {
    this.#source = source;
    this.#length = source.length;
    this.#pos = 0;
  }

  // ---------- Public API ----------

  /**
   * Returns the next token in the input stream.
   */
  nextToken() {
    this.#skipWhitespace();

    if (this.#pos >= this.#length) {
      return {
        type: TokenType.EOF,
        lexeme: "",
        position: this.#pos
      };
    }

    const c = this.#source[this.#pos];

    // Number literal
    if (this.#isDigit(c)) {
      return this.#number();
    }

    // Identifier
    if (this.#isAlpha(c)) {
      return this.#identifier();
    }

    // Single-character tokens
    switch (c) {
      case '+': return this.#single(TokenType.PLUS);
      case '-': return this.#single(TokenType.MINUS);
      case '*': return this.#single(TokenType.STAR);
      case '/': return this.#single(TokenType.SLASH);
      case '%': return this.#single(TokenType.PERCENT);
      case '.': return this.#single(TokenType.DOT);
      case '(': return this.#single(TokenType.LPAREN);
      case ')': return this.#single(TokenType.RPAREN);
    }

    throw new Error(`Unexpected character '${c}' at position ${this.#pos}`);
  }

  // ---------- Token Creation ----------

  #single(type) {
    const start = this.#pos;
    const ch = this.#source[this.#pos++];
    return {
      type,
      lexeme: ch,
      position: start
    };
  }

  #number() {
    const start = this.#pos;

    // Integer part
    while (this.#isDigit(this.#peek())) {
      this.#pos++;
    }

    // Optional fractional part
    if (this.#peek() === '.' && this.#isDigit(this.#peekNext())) {
      this.#pos++; // consume '.'
      while (this.#isDigit(this.#peek())) {
        this.#pos++;
      }
    }

    const lexeme = this.#source.slice(start, this.#pos);

    return {
      type: TokenType.NUMBER,
      lexeme,
      value: Number(lexeme),
      position: start
    };
  }

  #identifier() {
    const start = this.#pos;

    while (this.#isAlphaNumeric(this.#peek())) {
      this.#pos++;
    }

    const lexeme = this.#source.slice(start, this.#pos);

    return {
      type: TokenType.IDENTIFIER,
      lexeme,
      position: start
    };
  }

  // ---------- Character Handling ----------

  #skipWhitespace() {
    while (this.#pos < this.#length) {
      const c = this.#source[this.#pos];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
        this.#pos++;
      } else {
        break;
      }
    }
  }

  #peek() {
    if (this.#pos >= this.#length) return '\0';
    return this.#source[this.#pos];
  }

  #peekNext() {
    if (this.#pos + 1 >= this.#length) return '\0';
    return this.#source[this.#pos + 1];
  }

  #isDigit(c) {
    return c >= '0' && c <= '9';
  }

  #isAlpha(c) {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z');
  }

  #isAlphaNumeric(c) {
    return this.#isAlpha(c) ||
           this.#isDigit(c) ||
           c === '_';
  }

}
