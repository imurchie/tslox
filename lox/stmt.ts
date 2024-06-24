import { Token } from "../lox/token";
import { Expr } from "../lox/expr";

export class Stmt {
  accept<T>(visitor: Visitor<T>): T {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    throw new Error("Abstract classes cannot be instantiated.");
  }
}
export abstract class Visitor<T> {
  visitExpressionStmt(stmt: Expression): T {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    throw new Error("Abstract classes cannot be instantiated.");
  }

  visitPrintStmt(stmt: Print): T {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    throw new Error("Abstract classes cannot be instantiated.");
  }
}

export class Expression extends Stmt {
  expression: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(expression: Expr) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

export class Print extends Stmt {
  expression: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(expression: Expr) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}
