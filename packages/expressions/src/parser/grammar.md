# Expressions Grammar

This document describes the concrete grammar implemented by `Parser` in `Parser.ts` and some
proposed extensions.

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
- `.` — dot (member access)
- `(` — left parenthesis
- `)` — right parenthesis
- `,` — comma (argument separator in function calls)
- `EOF` — end of input

`UNKNOWN` tokens are treated as errors and are not part of the accepted language.

## Grammar (EBNF)

Start symbol: `Expression`

```ebnf
Expression      ::= Additive "EOF"

Additive        ::= Multiplicative ( ("+" | "-") Multiplicative )*

Multiplicative  ::= Unary ( ("*" | "/" | "%") Unary )*

Unary           ::= "-" Unary
                  | Primary

Primary         ::= NUMBER
                  | IdentifierChain
                  | "(" Additive ")"

IdentifierChain ::= IDENTIFIER ( "." IDENTIFIER )*
```

## Proposed extension: function calls

This section describes an extension to the grammar to support C-style function calls. It is a
specification only; parser and lexer support would need to be added to make it concrete.

Function calls use the usual syntax:

- `f()`
- `f(a, b, c)`
- `module.fn(1, 2 + 3)`

The extension is expressed as follows (using the existing `Additive` non-terminal for arguments so
that argument expressions obey the same precedence rules as top-level expressions):

```ebnf
Expression      ::= Additive "EOF"

Additive        ::= Multiplicative ( ("+" | "-") Multiplicative )*

Multiplicative  ::= Unary ( ("*" | "/" | "%") Unary )*

Unary           ::= "-" Unary
                  | Postfix

Postfix         ::= Primary ( "(" ArgumentList? ")" )*

Primary         ::= NUMBER
                  | IdentifierChain
                  | "(" Additive ")"

IdentifierChain ::= IDENTIFIER ( "." IDENTIFIER )*

ArgumentList    ::= Additive ( "," Additive )*
```

Notes on the extension:

- Member access and calls can be freely chained, e.g. `a.b(1).c(d)`.
- Calls bind more tightly than binary operators because they are part of the `Unary` → `Postfix`
  layer.
- An empty argument list (`f()`) is allowed via the `ArgumentList?` rule.

## Notes

- **Precedence**
  - Highest: unary minus (`-` as a prefix operator)
  - Next: multiplicative operators `*`, `/`, `%`
  - Lowest: additive operators `+`, `-` (infix)
- **Associativity**
  - Additive and multiplicative operators are **left-associative** due to the iterative parsing pattern: e.g. `a - b - c` parses as `(a - b) - c`.
- **Member access**
  - `IdentifierChain` allows chained member access using dots, e.g. `a`, `a.b`, `a.b.c`.
- **Parentheses**
  - Parentheses can be used to override precedence: e.g. `(1 + 2) * 3`.
