/* This is a generated file. Do not manually edit! */

import { Token } from "../lox/token"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Expr } from "../lox/expr";

export interface Stmt {
  accept<T>(visitor: Visitor<T>): T;
}
export interface Visitor<T> {
  visitBlockStmt(stmt: Block): T;
  visitExpressionStmt(stmt: Expression): T;
  visitIfStmt(stmt: If): T;
  visitPrintStmt(stmt: Print): T;
  visitVarStmt(stmt: Var): T;
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
