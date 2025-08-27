// lexer.test.ts
import { describe, it, expect } from 'vitest';
import { makeLexer, Rule, TokenIterator } from './lexer';

describe('Lexer', () => {
  const rules: Rule[] = [
    { name: 'NUMBER', pattern: /^[0-9]+/ },
    { name: 'PLUS', pattern: /^\+/ },
    { name: 'MINUS', pattern: /^-/ },
    { name: 'WS', pattern: /^\s+/, ignore: true },
  ];

  const lex = makeLexer(rules);

  it('should tokenize simple expression with whitespace', () => {
    const iter = lex('12 + 34 - 5');

    const tokens = [];
    while (iter.next()) {
      tokens.push(iter.token());
    }

    expect(tokens.map((t) => t.type)).toEqual([
      'NUMBER',
      'PLUS',
      'NUMBER',
      'MINUS',
      'NUMBER',
      'END',
    ]);
    expect(tokens[0]).toEqual({ type: 'NUMBER', value: '12', index: 0 });
    expect(tokens[1]).toEqual({ type: 'PLUS', value: '+', index: 3 });
    expect(tokens.at(-1)).toEqual({
      type: 'END',
      value: 'END',
      index: 11,
    });
  });

  it('should handle empty string input', () => {
    const iter = lex('');

    expect(iter.next()).toBe(true);
    expect(iter.token()).toEqual({ type: 'END', value: 'END', index: 0 });
    expect(iter.next()).toBe(false);
  });

  it('should throw on unexpected character', () => {
    const badLex = makeLexer([{ name: 'NUMBER', pattern: /^[0-9]+/ }]);
    expect(() => badLex('123x')).toThrowError(/Unexpected character at index 3: x/);
  });

  it('should handle multiple whitespace segments', () => {
    const iter = lex('  7   +   8  ');
    const tokens = [];
    while (iter.next()) {
      tokens.push(iter.token());
    }

    expect(tokens.map((t) => t.type)).toEqual(['NUMBER', 'PLUS', 'NUMBER', 'END']);
  });

  it('should prefer longest match when rules overlap', () => {
    const longLex = makeLexer([
      { name: 'MINUSMINUS', pattern: /^--/ },
      { name: 'MINUS', pattern: /^-/ },
      { name: 'WS', pattern: /^\s+/, ignore: true },
    ]);
    const iter = longLex('-- -');
    const tokens = [];
    while (iter.next()) {
      tokens.push(iter.token());
    }

    expect(tokens.map((t) => t.type)).toEqual(['MINUSMINUS', 'MINUS', 'END']);
  });

  it('should report correct indices even with ignored tokens', () => {
    const iter = lex('  42');
    iter.next();
    expect(iter.token()).toEqual({ type: 'NUMBER', value: '42', index: 2 });
  });

  it('should consume entire input', () => {
    const iter = lex('99');
    iter.next();
    expect(iter.token().type).toBe('NUMBER');
    iter.next();
    expect(iter.token().type).toBe('END');
  });
});

describe('Lexer with catch-all invalid token rule', () => {
  it('should not throw on invalid input, instead emit INVALID tokens', () => {
    const rules: Rule[] = [
      { name: 'NUMBER', pattern: /^[0-9]+/ },
      { name: 'PLUS', pattern: /^\+/ },
      { name: 'MINUS', pattern: /^-/ },
      { name: 'INVALID', pattern: /^./ }, // catch-all rule
    ];
    const lex = makeLexer(rules);

    const iter = lex('12x+?');
    const tokens = [];
    while (iter.next()) {
      tokens.push(iter.token());
    }

    expect(tokens.map((t) => t.type)).toEqual([
      'NUMBER',
      'INVALID', // x
      'PLUS',
      'INVALID', // ?
      'END',
    ]);
    expect(tokens[1]).toEqual({ type: 'INVALID', value: 'x', index: 2 });
    expect(tokens[3]).toEqual({ type: 'INVALID', value: '?', index: 4 });
  });

  it('should work with ignored whitespace and still catch invalid tokens', () => {
    const rules: Rule[] = [
      { name: 'NUMBER', pattern: /^[0-9]+/ },
      { name: 'WS', pattern: /^\s+/, ignore: true },
      { name: 'INVALID', pattern: /^./ },
    ];
    const lex = makeLexer(rules);

    const iter = lex('  @  ');
    const tokens = [];
    while (iter.next()) {
      tokens.push(iter.token());
    }

    expect(tokens.map((t) => t.type)).toEqual(['INVALID', 'END']);
    expect(tokens[0]).toEqual({ type: 'INVALID', value: '@', index: 2 });
  });
});

describe('TokenIterator', () => {
  const tokens = [
    { type: 'A', value: 'a', index: 0 },
    { type: 'B', value: 'b', index: 1 },
    { type: 'END', value: 'END', index: 2 },
  ];
  const iter = new TokenIterator(tokens);

  it('should advance with next()', () => {
    expect(iter.next()).toBe(true);
    expect(iter.token()).toEqual(tokens[0]);

    expect(iter.next()).toBe(true);
    expect(iter.t0()).toEqual(tokens[1]);

    expect(iter.next()).toBe(true);
    expect(iter.t0()).toEqual(tokens[2]);

    expect(iter.next()).toBe(false);
  });

  it('should throw if t0() called before next()', () => {
    const freshIter = new TokenIterator(tokens);
    expect(() => freshIter.t0()).toThrowError(/Invalid iterator position/);
  });

  it('should throw if t0() called after end', () => {
    const freshIter = new TokenIterator(tokens);
    while (freshIter.next()) {
      /* advance to end */
    }
    expect(freshIter.next()).toBe(false);
    expect(() => freshIter.t0()).toThrowError(/Invalid iterator position/);
  });

  it('should always end with END token', () => {
    const freshIter = new TokenIterator(tokens);
    let last;
    while (freshIter.next()) {
      last = freshIter.token();
    }
    expect(last.type).toBe('END');
  });
});
