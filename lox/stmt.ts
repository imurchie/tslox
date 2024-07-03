import { Token } from "../lox/token";  // eslint-disable-line @typescript-eslint/no-unused-vars
import { Expr } from "../lox/expr";


export class Stmt {
  accept<T>(visitor: Visitor<T>): T { // eslint-disable-line @typescript-eslint/no-unused-vars
    throw new Error("Abstract classes cannot be instantiated.");
  }
}
export interface Visitor<T> {
  visitExpressionStmt(stmt: Expression): T;
  visitPrintStmt(stmt: Print): T;
}


export class Expression extends Stmt {
  expression: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(expression: Expr) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}


export class Print extends Stmt {
  expression: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(expression: Expr) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}
