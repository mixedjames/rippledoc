# Expressions Grammar

This document describes the concrete grammar implemented by `Parser` in `Parser.ts`.

The current parser accepts a **single expression** followed by end-of-input.

## Lexical Tokens

The grammar is defined over the following terminal symbols produced by the lexer:

- `NUMBER` — numeric literal (e.g. `123`, `3.14`)
- `IDENTIFIER` — identifier (variable/property name)
- `+` — plus
- `-` — minus
- `*` — multiplication
- `/` — division
- `%` — remainder
- `<` — less than
- `>` — greater than
- `<=` — less than or equal
- `>=` — greater than or equal
- `==` — equal
- `!=` — not equal
- `.` — dot (member access)
- `(` — left parenthesis
- `)` — right parenthesis
- `,` — comma (argument separator in function calls)
- `EOF` — end of input

`UNKNOWN` tokens are treated as errors and are not part of the accepted language.

## Grammar (EBNF)

Start symbol: `Expression`

```ebnf
Expression      ::= Equality "EOF"

Equality        ::= Relational ( ("==" | "!=") Relational )*

Relational      ::= Additive ( ("<" | ">" | "<=" | ">=") Additive )*

Additive        ::= Multiplicative ( ("+" | "-") Multiplicative )*

Multiplicative  ::= Unary ( ("*" | "/" | "%") Unary )*

Unary           ::= "-" Unary
                  | Postfix

Postfix         ::= Primary ( "(" ArgumentList? ")" )?

Primary         ::= NUMBER
                  | IdentifierChain
                  | "(" Equality ")"

IdentifierChain ::= IDENTIFIER ( "." IDENTIFIER )*

ArgumentList    ::= Equality ( "," Equality )*
```

## Notes

- **Function calls**
  - Supported forms include `f()`, `f(a, b, c)`, and `module.fn(1, 2 + 3)`.
  - Call arguments are full expressions and follow the same precedence rules as top-level expressions.
  - Calls are supported on `IdentifierChain` expressions, and at most one call postfix is parsed.
- **Comparisons**
  - Comparison operators return numeric boolean values: `1` for true and `0` for false.
  - Equality operators (`==`, `!=`) and relational operators (`<`, `>`, `<=`, `>=`) are left-associative.
- **Precedence (highest to lowest)**
  - Unary minus (`-` as prefix)
  - Multiplicative operators `*`, `/`, `%`
  - Additive operators `+`, `-` (infix)
  - Relational operators `<`, `>`, `<=`, `>=`
  - Equality operators `==`, `!=`
- **Member access**
  - `IdentifierChain` allows dotted names, e.g. `a`, `a.b`, `a.b.c`.
- **Parentheses**
  - Parentheses override precedence, e.g. `(1 + 2) * 3`.
