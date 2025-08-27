import { makeLexer } from './expressions/lexer';

const longLex = makeLexer([
  { name: 'MINUSMINUS', pattern: /^--/ },
  { name: 'MINUS', pattern: /^-/ },
]);
const iter = longLex('---');
const tokens = [];
while (iter.next()) {
  tokens.push(iter.token());
}
