import { Binary, Expr, Grouping, Literal, Unary, Visitor as ExprVisitor, Variable, Assign } from "./expr";
import { Block, Expression, Print, Stmt, Visitor as StmtVisitor, Var } from "./stmt";
import { TokenType } from "./token_type";
import { Token } from "./token";
import { Environment } from "./environment";

export class RuntimeError extends Error {
  private _token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this._token = token;
  }

  get token() {
    return this._token;
  }
}

export class LoxReturnValue {
  private value: any;
  constructor(value: any) {
    this.value = value;
  }
  valueOf() {
    return this.value;
  }
}

export class Interpreter implements StmtVisitor<object>, ExprVisitor<object> {
  private hasError: boolean = false;
  private environment = new Environment();

  interpret(statements: Stmt[]): any {
    let res = null;
    try {
      for (const stmt of statements) {
        res = this.execute(stmt);
      }
    } catch (ex) {
      this.hasError = true;
      throw ex;
    }
    return res.valueOf();
  }

  get error(): boolean {
    return this.hasError;
  }

  set error(error: boolean) {
    this.hasError = error;
  }

  execute(stmt: Stmt): any {
    return stmt.accept(this);
  }

  executeBlock(statements: Stmt[], environment: Environment): void {
    const previous = this.environment;
    try {
      this.environment = environment;
      for (const stmt of statements) {
        this.execute(stmt);
      }
    } finally {
      // reset the environment when the block goes out of scope
      this.environment = previous;
    }
  }

  visitVarStmt(stmt: Var): object {
    let value: object = new Literal(null);

    if (!(stmt.initializer instanceof Literal && stmt.initializer.value == null)) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);

    return new LoxReturnValue(undefined);
  }

  visitExpressionStmt(stmt: Expression): object {
    return this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Print): object {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));

    return new LoxReturnValue(undefined);
  }

  visitBlockStmt(stmt: Block): object {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return new LoxReturnValue(undefined);
  }

  visitLiteralExpr(expr: Literal): object {
    return new LoxReturnValue(expr.value);
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
        throw new RuntimeError(expr.operator, "Trying to add wrong types");
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

  visitVariableExpr(expr: Variable): object {
    return this.environment.get(expr.name);
  }

  visitAssignExpr(expr: Assign): object {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  evaluate(expr: Expr): object {
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
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (typeof operand == "number") return;
    throw new RuntimeError(operator, `Operand must be a number, not '${typeof operand}' (${operand})`);
  }

  private checkNumberOperands(operator: Token, left: any, right: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (typeof left == "number" && typeof right == "number") return;
    throw new RuntimeError(
      operator,
      `Operands must be numbers, not '${typeof left}' (${left}) and '${typeof right}' (${right})`
    );
  }

  private stringify(obj: object): string {
    let value = obj.valueOf();
    if (value instanceof Literal) {
      value = value.value;
      if (value == null) {
        value = "nil";
      }
    }

    return String(value);
  }
}
