# TSLox: Typescript Lox

A [Typescript](https://www.typescriptlang.org/) implementation of the _Lox_ programming language tree-walk interpreter, based on the [Java](https://www.java.com/en/) implementation in [Robert Nystrom's](https://stuffwithstuff.com/) amazing book _[Crafting Interpreters](https://craftinginterpreters.com/)_.


## Grammar
| name | rule |
|------|------|
| program | declaration* EOF |
| declaration | varDecl \| statement |
| varDecl | "var" IDENTIFIER ( "=" expression )? ";" |
| statement | exprStmt \| forStmt \| ifStmt \| printStmt \| whileStmt \| block \| breakStmt |
| breakStmt | "break" ";" |
| forStmt | "for" "(" (varDecl \| exprStmt \| ";" ) expression? ";" expression? ")" statement |
| ifStmt | "if" "(" expression ")" statement ( "else" statement )? |
| whileStmt | "while" "(" expression ")" statement;
| block | "{" declaration "}" |
| exprStmt | expression ";" |
| printStmt | "print" expression ";" |
| expression | assignment |
| assignment | IDENTIFIER "=" assignment \| logic_or |
| logic_or | logic_and ( "or" logic_and )* |
| logic_and | equality ( "and" equality )* |
| equality | comparison ( ( "!=" \| "==" ) comparison)* |
| comparison | term ( ( ">" \| ">=" \| "<" \| "<=" ) term)* |
| term | factor ( ( "-" \| "+" ) factor)* |
| factor | unary ( ( "/" \| "\*" ) unary)* |
| unary | ( "!" \| "-" ) unary | call |
| call | primary ( "(" arguments? ")" )* |
| arguments | expression ( "," expression )* |
| primary | NUMBER \| STRING \| "true" \| "false" \| "nil" \| "(" expression ")" \| IDENTIFIER |


### AST generation

run `npm run build-ast` to create the Typescript classes for the grammar's pieces.
