import { Token } from "./token";
import { TokenType } from "./token_type";
import { Assign, Binary, Call, Expr, Get, Grouping, Literal, Logical, Set, Unary, Variable } from "./expr";
import { Block, Break, Class, Expression, Func, If, Print, Return, Stmt, Var, While } from "./stmt";
import { report } from "./errors";
import { MAX_ARITY } from "./constants";

class ParseError extends Error {}

export default class Parser {
  private tokens: Token[];
  private current: number = 0;
  private hasError = false;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      try {
        const decl = this.declaration();
        if (decl != null) {
          statements.push(decl);
        }
      } catch (ex) {
        // already logged, so allow to fall through
        // so that _all_ syntax errors get reported in a pass
      }
    }

    if (this.error) {
      throw new ParseError();
    }

    return statements;
  }

  get error(): boolean {
    return this.hasError;
  }

  set error(error: boolean) {
    this.hasError = error;
  }

  private declaration(): Stmt | null {
    try {
      if (this.match(TokenType.CLASS)) {
        return this.classDeclaration();
      }
      if (this.match(TokenType.FUN)) {
        return this.fnDeclaration("function");
      }
      if (this.match(TokenType.VAR)) {
        return this.varDeclaration();
      }

      return this.statement();
    } catch (ex) {
      this.synchronize();
      return null;
    }
  }

  private classDeclaration(): Class {
    const name = this.consume(TokenType.IDENTIFIER, "Expect class name");
    this.consume(TokenType.LEFT_BRACE, `Expect '{' before class body`);

    let methods: Func[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.fnDeclaration("method"));
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body");

    return new Class(name, methods);
  }

  private fnDeclaration(kind: string): Func {
    const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name`);
    this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name`);

    const parameters: Token[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (parameters.length >= MAX_ARITY) {
          this.reportError(this.peek(), `Cannot have more than ${MAX_ARITY} parameters`);
        }

        parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name"));
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters");

    this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body`);
    const body = this.block();

    return new Func(name, parameters, body);
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name");

    let initializer: Expr = new Literal(null);
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration");
    return new Var(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return new Block(this.block());
    }
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }
    if (this.match(TokenType.FOR)) {
      return this.forStatement();
    }
    if (this.match(TokenType.BREAK)) {
      return this.breakStatement();
    }
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement();
    }
    return this.expressionStatement();
  }

  private ifStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition");

    const thenBranch = this.statement();
    let elseBranch: Stmt | null = null;
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }

  private printStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, `Expect ';' after value.`);
    return new Print(expr);
  }

  private block(): Stmt[] {
    const statements: Stmt[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt != null) {
        statements.push(stmt);
      }
    }
    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block");

    return statements;
  }

  private whileStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition");
    const body = this.statement();

    return new While(condition, body);
  }

  private forStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'");

    let initializer: Stmt | null = null;
    if (this.match(TokenType.SEMICOLON)) {
      // remains null
    } else if (this.match(TokenType.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr = new Literal(true);
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after for loop condition");

    let increment: Expr = new Literal(true);
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses");

    let body = this.statement();

    // run the increment after the body
    if (increment != null) {
      body = new Block([body, new Expression(increment)]);
    }

    // create a while loop with the condition
    body = new While(condition, body);

    // if there is an initializer, run it before the body
    if (initializer != null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  private breakStatement(): Stmt {
    const breakToken = this.previous();
    this.consume(TokenType.SEMICOLON, "Expect ';' after break");
    return new Break(breakToken);
  }

  private returnStatement(): Stmt {
    const keyword = this.previous();
    let value: Expr = new Literal(null);
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after return value");
    return new Return(keyword, value);
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, `Expect ';' after expression.`);
    return new Expression(expr);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.or();

    console.log("trying assignment", expr);
    if (this.match(TokenType.EQUAL)) {
      console.log("matfches equal");
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const name = expr.name;
        return new Assign(name, value);
      } else if (expr instanceof Get) {
        console.log("here");
        return new Set(expr.object, expr.name, value);
      }

      // report error, but do not throw, since this is not
      // a situation that needs to be recovered from
      this.reportError(equals, "Invalid assignment target");
    }

    return expr;
  }

  private or(): Expr {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'");
        expr = new Get(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Expr {
    let args: Expr[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length >= MAX_ARITY) {
          this.reportError(this.peek(), `Cannot have more than ${MAX_ARITY} arguments`);
        }
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments");

    return new Call(callee, paren, args);
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, `Expect ')' after expression`);
      return new Grouping(expr);
    }

    throw this.reportError(this.peek(), "Expect expression");
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private match(...types: string[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(type: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type == TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: string, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.reportError(this.peek(), message);
  }

  private reportError(token: Token, message: string): ParseError {
    this.error = true;

    if (token.type == TokenType.EOF) {
      report(token.line, ` at end`, message);
    } else {
      report(token.line, ` at '${token.lexeme}'`, message);
    }

    return new ParseError(message);
  }
}
