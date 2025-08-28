import { makeLexer, TokenIterator } from './lexer';

/**

  Grammar for expressions:
  (we use slightly odd notation because I want to match Yacc where possible but I also want 
  non-terminals to match their appearance in code)

  RootExpression
    : PostfixExpression
    ;

  AdditiveExpression
    : MultiplicativeExpression
    | AdditiveExpression '*' MultiplicativeExpression
    | AdditiveExpression '/' MultiplicativeExpression
    ;

  MultiplicativeExpression
    : PostfixExpression
    | MultiplicativeExpression '*' PostfixExpression
    | MultiplicativeExpression '/' PostfixExpression
    ;

  PostfixExpression
    : PrimaryExpression
    | PostfixExpression '[' RootExpression ']'
    | PostfixExpression '(' ArgumentList ')'
    | PostfixExpression '.' ID
    ;

  ArgumentList
    : E // FIXME: not implemented but in grammar so I don't forget it
    ;

  PrimaryExpression
    : ID
    | CONST
    | '(' RootExpression ')'
    ;

 */

const lexerFactory = makeLexer([
  { name: 'WS', pattern: /^\s+/, ignore: true },
  { name: 'ID', pattern: /^[_A-Za-z][_A-Za-z0-9]*/ },
  { name: 'CONST', pattern: /^[0-9]+(\.[0-9]+)?/ },

  { name: 'PLUS', pattern: /^\+/ },
  { name: 'MINUS', pattern: /^\-/ },
  { name: 'MULTIPLY', pattern: /^\*/ },
  { name: 'DIVIDE', pattern: /^\// },

  { name: 'O_PAREN', pattern: /^\(/ },
  { name: 'C_PAREN', pattern: /^\)/ },
  { name: 'O_BRACK', pattern: /^\[/ },
  { name: 'C_BRACK', pattern: /^\]/ },

  { name: 'DOT', pattern: /^\./ },
  { name: 'COMMA', pattern: /^\,/ },

  { name: 'INVALID', pattern: /^./ },
]);

export function parseExpression(expressionString: string): void {
  const lexer = lexerFactory(expressionString);

  lexer.next();

  if (!parseRootExpression(lexer)) {
    throw new Error(`Syntax error at ${lexer.t0().index}: unexpected ${lexer.t0().value}`);
  }
  match(lexer, 'END');
}

function parseRootExpression(lexer: TokenIterator) {
  return parseAdditiveExpression(lexer);
}

function parseAdditiveExpression(lexer: TokenIterator) {
  let matchedNRProduction: any;

  // Try non-recursive productions...
  matchedNRProduction = parseMultiplicativeExpression(lexer);

  if (!matchedNRProduction) {
    return null;
  }

  // Now try to match a left-recursive pattern from the next token...
  while (true) {
    switch (lexer.t0().type) {
      case 'PLUS':
        lexer.next();

        if (!parseMultiplicativeExpression(lexer)) {
          throw new Error(`Syntax error at ${lexer.t0().index}: unexpected ${lexer.t0().value}`);
        }
        continue;

      case 'MINUS':
        lexer.next();

        if (!parseMultiplicativeExpression(lexer)) {
          throw new Error(`Syntax error at ${lexer.t0().index}: unexpected ${lexer.t0().value}`);
        }
        continue;
    } //switch

    return true;
  } //while
}

function parseMultiplicativeExpression(lexer: TokenIterator) {
  let matchedNRProduction: any;

  // Try non-recursive productions...
  matchedNRProduction = parsePostfixExpression(lexer);

  if (!matchedNRProduction) {
    return null;
  }

  // Now try to match a left-recursive pattern from the next token...
  while (true) {
    switch (lexer.t0().type) {
      case 'MULTIPLY':
        lexer.next();

        if (!parsePostfixExpression(lexer)) {
          throw new Error(`Syntax error at ${lexer.t0().index}: unexpected ${lexer.t0().value}`);
        }
        continue;

      case 'DIVIDE':
        lexer.next();

        if (!parsePostfixExpression(lexer)) {
          throw new Error(`Syntax error at ${lexer.t0().index}: unexpected ${lexer.t0().value}`);
        }
        continue;
    } //switch

    return true;
  } //while
}

function parsePostfixExpression(lexer: TokenIterator) {
  let matchedNRProduction: any;

  // Try non-recursive productions...
  matchedNRProduction = parsePrimaryExpression(lexer);

  if (!matchedNRProduction) {
    return null;
  }

  // Now try to match a left-recursive pattern from the next token...
  while (true) {
    switch (lexer.t0().type) {
      case 'O_BRACK':
        lexer.next();

        if (!parseRootExpression(lexer)) {
          throw new Error(`Syntax error at ${lexer.t0().index}: unexpected ${lexer.t0().value}`);
        }

        match(lexer, 'C_BRACK');
        continue;

      case 'O_PAREN':
        lexer.next();
        match(lexer, 'C_PAREN');
        continue;

      case 'DOT':
        lexer.next();
        match(lexer, 'ID');
        continue;
    } //switch

    return true;
  }
}

function parsePrimaryExpression(lexer: TokenIterator) {
  switch (lexer.t0().type) {
    case 'ID':
      lexer.next();
      return true;

    case 'CONST':
      lexer.next();
      return true;

    case 'O_PAREN':
      lexer.next();
      if (!parseRootExpression(lexer)) {
        throw new Error(`Syntax error at ${lexer.t0().index}: unexpected ${lexer.t0().value}`);
      }
      match(lexer, 'C_PAREN');
      return true;
  }

  return null;
}

function match(lexer: TokenIterator, tokenType: string) {
  if (lexer.t0().type === tokenType) {
    lexer.next();
  } else {
    throw new Error(
      `Syntax error at ${lexer.t0().index}: expected ${tokenType} but got ${lexer.t0().value}`,
    );
  }
}
