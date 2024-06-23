import exp from "constants";
import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./grammar";
import { TokenType } from "./token_type";
import { Token } from "./token";

class RuntimeError extends Error {
  private _token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this._token = token;
  }

  get token() {
    return this._token;
  }
}

export class Interpreter extends Visitor<object> {
  private hasError: boolean = false;

  interpret(expr: Expr) {
    try {
      const value = this.evaluate(expr);
      console.log(this.stringify(value));
    } catch (ex) {
      this.hasError = true;
      console.log("error:", ex);
    }
  }

  get error(): boolean {
    return this.hasError;
  }

  set error(error: boolean) {
    this.hasError = error;
  }

  visitLiteralExpr(expr: Literal): object {
    return Object(expr.value);
  }

  visitGroupingExpr(expr: Grouping): object {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Unary): object {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return new Number(-right);
      case TokenType.BANG:
        return new Boolean(!this.isTruthy(right));
    }

    // unreachable
    return new Object(null);
  }

  visitBinaryExpr(expr: Binary): object {
    const left = this.evaluate(expr.left).valueOf();
    const right = this.evaluate(expr.right).valueOf();

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(Number(left) + Number(right));
      case TokenType.PLUS:
        if (typeof left == "number" && typeof right == "number") {
          return new Number(left + right);
        }
        if (typeof left == "string" && typeof right == "string") {
          return new String(left + right);
        }
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(Number(left) / Number(right));
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(Number(left) * Number(right));
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(left > right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(left >= right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(left < right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(left <= right);
      case TokenType.BANG_EQUAL:
        return new Boolean(!this.isEqual(left, right));
      case TokenType.EQUAL_EQUAL:
        return new Boolean(this.isEqual(left, right));
    }

    // unreachable
    return new Object(null);
  }

  private evaluate(expr: Expr): object {
    return expr.accept(this);
  }

  private isTruthy(obj: object): boolean {
    if (obj == null) return false;
    if (typeof obj == "boolean") return Boolean(obj);
    return true;
  }

  private isEqual(a: object, b: object): boolean {
    if (a == null && b == null) return true;
    if (a == null) return false;
    return a == b;
  }

  private checkNumberOperand(operator: Token, operand: any) {
    if (typeof operand == "number") return;
    throw new RuntimeError(operator, `Operand must be a number, not '${typeof operand}' (${operand})`);
  }

  private checkNumberOperands(operator: Token, left: any, right: any) {
    if (typeof left == "number" && typeof right == "number") return;
    throw new RuntimeError(
      operator,
      `Operands must be numbers, not '${typeof left}' (${left}) and '${typeof right}' (${right})`
    );
  }

  private stringify(obj: object): string {
    const value = obj.valueOf();

    if (value == null) return "nil";

    return `${value}`;
  }
}
