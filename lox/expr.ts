/* This is a generated file. Do not manually edit! */

import { Token } from "../lox/token"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Expr {
  accept<T>(visitor: Visitor<T>): T;
}
export interface Visitor<T> {
  visitAssignExpr(expr: Assign): T;
  visitBinaryExpr(expr: Binary): T;
  visitCallExpr(expr: Call): T;
  visitGetExpr(expr: Get): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitLogicalExpr(expr: Logical): T;
  visitSetExpr(expr: Set): T;
  visitThisExpr(expr: This): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
}

export class Assign implements Expr {
  name: Token;
  value: Expr;

  constructor(name: Token, value: Expr) {
    this.name = name;
    this.value = value;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitAssignExpr(this);
  }

  toString(): string {
    return `Assign { name: ${this.name} value: ${this.value} }`;
  }
}

export class Binary implements Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }

  toString(): string {
    return `Binary { left: ${this.left} operator: ${this.operator} right: ${this.right} }`;
  }
}

export class Call implements Expr {
  callee: Expr;
  paren: Token;
  args: Expr[];

  constructor(callee: Expr, paren: Token, args: Expr[]) {
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCallExpr(this);
  }

  toString(): string {
    return `Call { callee: ${this.callee} paren: ${this.paren} args: ${this.args} }`;
  }
}

export class Get implements Expr {
  object: Expr;
  name: Token;

  constructor(object: Expr, name: Token) {
    this.object = object;
    this.name = name;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGetExpr(this);
  }

  toString(): string {
    return `Get { object: ${this.object} name: ${this.name} }`;
  }
}

export class Grouping implements Expr {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }

  toString(): string {
    return `Grouping { expression: ${this.expression} }`;
  }
}

export class Literal implements Expr {
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(value: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    this.value = value;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }

  toString(): string {
    return `Literal { value: ${this.value} }`;
  }
}

export class Logical implements Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }

  toString(): string {
    return `Logical { left: ${this.left} operator: ${this.operator} right: ${this.right} }`;
  }
}

export class Set implements Expr {
  object: Expr;
  name: Token;
  value: Expr;

  constructor(object: Expr, name: Token, value: Expr) {
    this.object = object;
    this.name = name;
    this.value = value;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSetExpr(this);
  }

  toString(): string {
    return `Set { object: ${this.object} name: ${this.name} value: ${this.value} }`;
  }
}

export class This implements Expr {
  keyword: Token;

  constructor(keyword: Token) {
    this.keyword = keyword;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitThisExpr(this);
  }

  toString(): string {
    return `This { keyword: ${this.keyword} }`;
  }
}

export class Unary implements Expr {
  operator: Token;
  right: Expr;

  constructor(operator: Token, right: Expr) {
    this.operator = operator;
    this.right = right;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }

  toString(): string {
    return `Unary { operator: ${this.operator} right: ${this.right} }`;
  }
}

export class Variable implements Expr {
  name: Token;

  constructor(name: Token) {
    this.name = name;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVariableExpr(this);
  }

  toString(): string {
    return `Variable { name: ${this.name} }`;
  }
}
