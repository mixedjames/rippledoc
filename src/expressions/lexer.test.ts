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
});
