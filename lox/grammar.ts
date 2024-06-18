import { Token } from "../lox/token";

export class Expr {}


export class Binary extends Expr {
  private left: Expr;
  private operator: Token;
  private right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}


export class Grouping extends Expr {
  private expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
}


export class Literal extends Expr {
  private value: Object;

  constructor(value: Object) {
    super();
    this.value = value;
  }
}


export class Unary extends Expr {
  private operator: Token;
  private right: Expr;

  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }
}
