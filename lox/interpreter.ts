import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  Visitor as ExprVisitor,
  Variable,
  Assign,
  Logical,
  Call,
  Get,
  Set,
} from "./expr";
import {
  Block,
  Break,
  Class,
  Expression,
  Func,
  If,
  Print,
  Return,
  Stmt,
  Visitor as StmtVisitor,
  Var,
  While,
} from "./stmt";
import { TokenType } from "./token_type";
import { Token } from "./token";
import { Environment } from "./environment";
import { LoxCallable, LoxClass, LoxFunction, LoxInstance, LoxReturnValue } from "./internal";
import { ClockBuiltin } from "./builtins";
import { Interpreter } from "./interfaces";

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

class BreakException extends Error {}

export class ReturnException extends Error {
  value: object | null = null;

  constructor(value: object | null) {
    super();
    this.value = value;
  }
}

export class LoxInterpreter implements Interpreter, StmtVisitor<object>, ExprVisitor<object> {
  private hasError: boolean = false;
  globals = new Environment();
  environment = this.globals;
  private locals = new Map<Expr, number>();

  constructor() {
    this.globals.define("clock", new ClockBuiltin());
  }

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

  visitClassStmt(stmt: Class): object {
    this.environment.define(stmt.name, new Object(null));

    let methods: Map<string, LoxFunction> = new Map();
    for (const method of stmt.methods) {
      const func = new LoxFunction(method, this.environment);
      methods.set(method.name.lexeme, func);
    }

    const klass = new LoxClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);

    return new LoxReturnValue(undefined);
  }

  visitFuncStmt(stmt: Func): object {
    const fn = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name, fn);
    return new LoxReturnValue(undefined);
  }

  visitVarStmt(stmt: Var): object {
    let value: object = new Literal(null);

    if (!(stmt.initializer instanceof Literal && stmt.initializer.value == null)) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name, value);

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

  visitReturnStmt(stmt: Return): object {
    let value: object | null = null;
    if (stmt.value != null) {
      value = this.evaluate(stmt.value);
    }

    throw new ReturnException(value);
  }

  visitBlockStmt(stmt: Block): object {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return new LoxReturnValue(undefined);
  }

  visitIfStmt(stmt: If): object {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else {
      if (stmt.elseBranch != null) {
        this.execute(stmt.elseBranch);
      }
    }
    return new LoxReturnValue(undefined);
  }

  visitWhileStmt(stmt: While): object {
    try {
      while (this.isTruthy(this.evaluate(stmt.condition))) {
        this.execute(stmt.body);
      }
    } catch (ex) {
      if (!(ex instanceof BreakException)) {
        throw ex;
      }
    }

    return new LoxReturnValue(undefined);
  }

  visitBreakStmt(stmt: Break): object {
    throw new BreakException();
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
    return new LoxReturnValue(undefined);
  }

  visitBinaryExpr(expr: Binary): object {
    const left = this.evaluate(expr.left).valueOf();
    const right = this.evaluate(expr.right).valueOf();

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(Number(left) - Number(right));
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
        return new Boolean(left < right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return new Number(left <= right);
      case TokenType.BANG_EQUAL:
        return new Boolean(!this.isEqual(left, right));
      case TokenType.EQUAL_EQUAL:
        return new Boolean(this.isEqual(left, right));
    }

    // unreachable
    return new LoxReturnValue(undefined);
  }

  visitVariableExpr(expr: Variable): object {
    // return this.environment.get(expr.name);
    return this.lookUpVariable(expr.name, expr);
  }

  visitAssignExpr(expr: Assign): object {
    const value = this.evaluate(expr.value);
    // this.environment.assign(expr.name, value);

    const distance = this.locals.get(expr);
    if (distance != null) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    return value;
  }

  visitLogicalExpr(expr: Logical): object {
    const left = this.evaluate(expr.left);

    if (expr.operator.type == TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitCallExpr(expr: Call): object {
    const callee = this.evaluate(expr.callee).valueOf();

    let args: object[] = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    if (!(callee instanceof LoxCallable)) {
      throw new RuntimeError(expr.paren, "Can only call functions and classes");
    }

    const arity = callee.arity();
    if (args.length !== arity) {
      throw new RuntimeError(expr.paren, `Expected ${arity} arguments but got ${args.length}`);
    }

    return callee.call(this, args);
  }

  visitGetExpr(expr: Get): object {
    const object = this.evaluate(expr.object).valueOf();

    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, "Only instances have properties");
  }

  visitSetExpr(expr: Set): object {
    const object = this.evaluate(expr.object).valueOf();

    if (!(object instanceof LoxInstance)) {
      throw new RuntimeError(expr.name, "Only instances have fields");
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  evaluate(expr: Expr): object {
    return expr.accept(this);
  }

  private isTruthy(obj: object): boolean {
    if (obj == null) return false;
    if (typeof obj == "boolean") return Boolean(obj);
    return !!obj.valueOf();
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
    }

    if (value == null) {
      value = "nil";
    }

    return String(value);
  }

  resolve(expr: Expr, depth: number): void {
    this.locals.set(expr, depth);
  }

  lookUpVariable(name: Token, expr: Expr): object {
    const distance = this.locals.get(expr);
    if (distance != null) {
      return this.environment.getAt(distance, name);
    } else {
      return this.globals.get(name);
    }
  }
}
