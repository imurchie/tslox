import { Token } from "../lox/token";  // eslint-disable-line @typescript-eslint/no-unused-vars


export class Expr {
  accept<T>(visitor: Visitor<T>): T { // eslint-disable-line @typescript-eslint/no-unused-vars
    throw new Error("Abstract classes cannot be instantiated.");
  }
}
export interface Visitor<T> {
  visitBinaryExpr(expr: Binary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitUnaryExpr(expr: Unary): T;
}


export class Binary extends Expr {
  left: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any
  operator: Token; // eslint-disable-line @typescript-eslint/no-explicit-any
  right: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(left: Expr, operator: Token, right: Expr) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}


export class Grouping extends Expr {
  expression: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(expression: Expr) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}


export class Literal extends Expr {
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(value: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.value = value;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}


export class Unary extends Expr {
  operator: Token; // eslint-disable-line @typescript-eslint/no-explicit-any
  right: Expr; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(operator: Token, right: Expr) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super();
    this.operator = operator;
    this.right = right;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}
