# TSLox: Typescript Lox

A Typescript implementation of the _Lox_ programming language interpreter.


## Grammar
| name | rule |
|------|------|
| expression | equality |
| equality | comparison ( ( "!=" \| "==" ) comparison)* |
| comparison | term ( ( ">" \| ">=" \| "<" \| "<=" ) term)* |
| term | factor ( ( "-" \| "+" ) factor)* |
| factor | unary ( ( "/" \| "*" ) unary)* |
| unary | ( "!" \| "-" ) unary | primary |
| primary | NUMBER \| STRING \| "true" \| "false" \| "nil" \| "(" expression ")" |


### AST generation

run `npm run build-ast` to create the Typescript classes for the grammar's pieces.
