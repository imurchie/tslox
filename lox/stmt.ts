/* This is a generated file. Do not manually edit! */

import { Token } from "../lox/token"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Expr } from "../lox/expr";

export interface Stmt {
  accept<T>(visitor: Visitor<T>): T;
}
export interface Visitor<T> {
  visitBlockStmt(stmt: Block): T;
  visitBreakStmt(stmt: Break): T;
  visitExpressionStmt(stmt: Expression): T;
  visitFuncStmt(stmt: Func): T;
  visitIfStmt(stmt: If): T;
  visitPrintStmt(stmt: Print): T;
  visitReturnStmt(stmt: Return): T;
  visitVarStmt(stmt: Var): T;
  visitWhileStmt(stmt: While): T;
}

export class Block implements Stmt {
  statements: Stmt[];

  constructor(statements: Stmt[]) {
    this.statements = statements;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBlockStmt(this);
  }

  toString(): string {
    return `Block { statements: ${this.statements} }`;
  }
}

export class Break implements Stmt {
  token: Token;

  constructor(token: Token) {
    this.token = token;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBreakStmt(this);
  }

  toString(): string {
    return `Break { token: ${this.token} }`;
  }
}

export class Expression implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }

  toString(): string {
    return `Expression { expression: ${this.expression} }`;
  }
}

export class Func implements Stmt {
  name: Token;
  params: Token[];
  body: Stmt[];

  constructor(name: Token, params: Token[], body: Stmt[]) {
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitFuncStmt(this);
  }

  toString(): string {
    return `Func { name: ${this.name} params: ${this.params} body: ${this.body} }`;
  }
}

export class If implements Stmt {
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt | null;

  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIfStmt(this);
  }

  toString(): string {
    return `If { condition: ${this.condition} thenBranch: ${this.thenBranch} elseBranch: ${this.elseBranch} }`;
  }
}

export class Print implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStmt(this);
  }

  toString(): string {
    return `Print { expression: ${this.expression} }`;
  }
}

export class Return implements Stmt {
  keyword: Token;
  value: Expr;

  constructor(keyword: Token, value: Expr) {
    this.keyword = keyword;
    this.value = value;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitReturnStmt(this);
  }

  toString(): string {
    return `Return { keyword: ${this.keyword} value: ${this.value} }`;
  }
}

export class Var implements Stmt {
  name: Token;
  initializer: Expr;

  constructor(name: Token, initializer: Expr) {
    this.name = name;
    this.initializer = initializer;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVarStmt(this);
  }

  toString(): string {
    return `Var { name: ${this.name} initializer: ${this.initializer} }`;
  }
}

export class While implements Stmt {
  condition: Expr;
  body: Stmt;

  constructor(condition: Expr, body: Stmt) {
    this.condition = condition;
    this.body = body;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitWhileStmt(this);
  }

  toString(): string {
    return `While { condition: ${this.condition} body: ${this.body} }`;
  }
}
