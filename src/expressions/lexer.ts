// lexer.ts

/**
 * A single tokenization rule.
 */
export interface Rule {
  /** The name/type of the token. */
  name: string;

  /** Regex pattern to match the token. */
  pattern: RegExp;

  /** Whether this token should be ignored (e.g., whitespace). */
  ignore?: boolean;
}

/**
 * A token produced by the lexer.
 */
export interface Token {
  /** Token type (e.g., IDENT, NUMBER, OPERATOR, etc.). */
  type: string;

  /** The matched substring. */
  value: string;

  /** Index in the source string where this token starts. */
  index: number;
}

/**
 * Creates a lexer function that converts a string into an iterator of tokens.
 *
 * @param rules - The tokenization rules.
 * @returns A function that lexes an input string into tokens.
 */
export function makeLexer(rules: Rule[]): (theString: string) => TokenIterator {
  return function (theString: string): TokenIterator {
    return new TokenIterator(lex(theString, rules));
  };
}

/**
 * Lexical analysis: converts a string into an array of tokens based on rules.
 *
 * @param theString - The input string to tokenize.
 * @param rules - The tokenization rules.
 * @returns The list of matched tokens.
 * @throws If no rule matches a character at the current position.
 */
function lex(theString: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < theString.length) {
    // Try each token specification.
    const matchingRule = rules.find((rule) => {
      const { name, pattern, ignore = false } = rule;

      const substring = theString.slice(i);
      const result = pattern.exec(substring);

      console.dir(result);

      if (result) {
        if (!ignore) {
          tokens.push({ type: name, value: result[0], index: i });
        }

        i += result[0].length;
        return true;
      } else {
        return false;
      }
    });

    if (matchingRule === undefined) {
      throw new Error(`Unexpected character at index ${i}: ${theString[i]}`);
    }
  }

  tokens.push({ type: 'END', value: 'END', index: theString.length });

  return tokens;
}

/**
 * An iterator over a sequence of tokens.
 */
export class TokenIterator {
  #tokens: Token[];
  #i = -1;

  constructor(tokens: Token[]) {
    this.#tokens = tokens;
  }

  /**
   * Advances the iterator to the next token.
   *
   * @returns True if the iterator successfully moved to the next token, false if at the end.
   */
  next(): boolean {
    return ++this.#i < this.#tokens.length;
  }

  /**
   * Gets the current token (alias for {@link TokenIterator#t0}).
   */
  token(): Token {
    return this.t0();
  }

  /**
   * Gets the current token.
   */
  t0(): Token {
    if (this.#i < 0 || this.#i >= this.#tokens.length) {
      throw new Error('TokenIterator: Invalid iterator position.');
    }

    const t0 = this.#tokens[this.#i];

    if (t0 === undefined || t0 === null) {
      throw new Error('TokenIterator: Invalid token at current position.');
    }

    return t0;
  }
}
