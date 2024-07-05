import { Token } from "../lox/token";  // eslint-disable-line @typescript-eslint/no-unused-vars
import { Expr } from "../lox/expr";


export interface Stmt {
  accept<T>(visitor: Visitor<T>): T;
}
export interface Visitor<T> {
  visitExpressionStmt(stmt: Expression): T;
  visitPrintStmt(stmt: Print): T;
  visitVarStmt(stmt: Var): T;
}


export class Expression implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStmt(this);
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
}
