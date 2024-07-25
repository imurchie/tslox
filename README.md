# TSLox: Typescript Lox

A [Typescript](https://www.typescriptlang.org/) implementation of the _Lox_ programming language tree-walk interpreter, based on the [Java](https://www.java.com/en/) implementation in [Robert Nystrom's](https://stuffwithstuff.com/) amazing book _[Crafting Interpreters](https://craftinginterpreters.com/)_.


## Grammar

`program`      → `declaration`* `EOF` ;<br />
`declaration`  → `classDecl` \| `fnDecl` | `varDecl` | `statement` ;<br />
`classDecl`    → "class" `IDENTIFIER` ( "<" `IDENTIFIER` )? "{" function* "}" ;
`fnDecl`       → "fun" `function` ;<br />
`function`     → `IDENTIFIER` "(" `parameters?` ")" `block` ;<br />
`parameters`   → `IDENTIFIER` ( "," `IDENTIFIER` )* ;<br />
`varDecl`      → "var" `IDENTIFIER` ( "=" `expression` )? ";" ;<br />
`statement`    → `exprStmt` | `forStmt` | `ifStmt` | `printStmt` | `returnStmt` | `whileStmt` | `block` | `breakStmt` ;<br />
`breakStmt`    → "break" ";" ;<br />
`forStmt`      → "for" `"("` ( `varDecl` | `exprStmt` | ";" ) `expression`? ";" `expression`? ")" `statement` ;<br />
`ifStmt`       → "if" "(" `expression` ")" `statement` ( "else" `statement` )? ;<br />
`whileStmt`    → "while" "(" `expression` ")" `statement` ;<br />
`block`        → "{" `declaration` "}" ;<br />
`exprStmt`     → `expression` ";" ;<br />
`printStmt`    → "print" `expression` ";" ;<br />
`returnStmt`   → "return" `expression`? ";" ;<br />
`expression`   → `assignment` ;<br />
`assignment`   → ( `call` ".")? `IDENTIFIER` "=" `assignment` | `logic_or` ;<br />
`logic_or`     → `logic_and` ( "or" `logic_and` )* ;<br />
`logic_and`    → `equality` ( "and" `equality` )* ;<br />
`equality`     → `comparison` ( ( "!=" | "==" ) `comparison` )* ;<br />
`comparison`   → `term` ( ( ">" | ">=" | "<" | "<=" ) `term` )* ;<br />
`term`         → `factor` ( ( "-" | "+" ) `factor` )* ;<br />
`factor`       → `unary` ( ( "/" | "\*" ) `unary` )* ;<br />
`unary`        → ( "!" | "-" ) `unary` | `call` ;<br />
`call`         → `primary` ( "(" `arguments`? ")" | "." `IDENTIFIER` )* ;<br />
`arguments`    → `expression` ( "," `expression` )* ;<br />
`primary`      → `NUMBER` | `STRING` | "true" | "false" | "nil" | "(" `expression` ")" | `IDENTIFIER` | "super" "." `IDENTIFIER` ;<br />


### AST generation

run `npm run build-ast` to create the Typescript classes for the grammar's pieces.
