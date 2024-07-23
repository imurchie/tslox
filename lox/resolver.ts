import {
  Assign,
  Binary,
  Call,
  Expr,
  Visitor as ExprVisitor,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from "./expr";
import { Interpreter } from "./interfaces";
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
import { Token } from "./token";
import { report } from "./errors";
import { TokenType } from "./token_type";

class ResolverError extends Error {}

class ScopeStack {
  private scopes: Array<Map<string, boolean>> = new Array<Map<string, boolean>>();

  start(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  end(): void {
    this.scopes.pop();
  }

  get(index: number): Map<string, boolean> | undefined {
    return this.scopes[index];
  }

  get current(): Map<string, boolean> | undefined {
    return this.scopes[this.scopes.length - 1];
  }

  get empty(): boolean {
    return this.scopes.length === 0;
  }

  get length(): number {
    return this.scopes.length;
  }
}

const FunctionType = {
  NONE: 0,
  FUNCTION: 1,
};

const LoopType = {
  NONE: 0,
  WHILE: 1,
};

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private interpreter: Interpreter;
  private scopes = new ScopeStack();
  private currentFunction = FunctionType.NONE;
  private currentLoop = LoopType.NONE;
  private hasError = false;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  get error(): boolean {
    return this.hasError;
  }

  set error(error: boolean) {
    this.hasError = error;
  }

  resolve(node: Expr | Stmt | Stmt[]): void {
    if (Array.isArray(node)) {
      // list of statments
      for (const stmt of node) {
        this.resolve(stmt);
      }
    } else {
      node.accept(this);
    }

    if (this.error) {
      throw new ResolverError();
    }
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes.get(i)?.has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  private resolveFunction(stmt: Func, functionType: number): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = functionType;

    this.beginScope();
    for (const param of stmt.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(stmt.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer != null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  visitVariableExpr(expr: Variable): void {
    if (!this.scopes.empty && this.scopes.current?.get(expr.name.lexeme) === false) {
      this.reportError(expr.name, `Cannot read local variable '${expr.name.lexeme}' in its own initializer`);
    }

    this.resolveLocal(expr, expr.name);
  }

  visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitFuncStmt(stmt: Func): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitClassStmt(stmt: Class): void {
    this.declare(stmt.name);
    this.define(stmt.name);
  }

  visitExpressionStmt(stmt: Expression): void {
    this.resolve(stmt.expression);
  }

  visitIfStmt(stmt: If): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch != null) {
      this.resolve(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Print): void {
    this.resolve(stmt.expression);
  }

  visitReturnStmt(stmt: Return): void {
    if (this.currentFunction == FunctionType.NONE) {
      this.reportError(stmt.keyword, `Cannot return from top-level code`);
    }
    if (stmt.value != null) {
      this.resolve(stmt.value);
    }
  }

  visitWhileStmt(stmt: While): void {
    const enclosingLoop = this.currentLoop;
    this.currentLoop = LoopType.WHILE;

    this.resolve(stmt.condition);
    this.resolve(stmt.body);

    this.currentLoop = enclosingLoop;
  }

  visitBinaryExpr(expr: Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitBreakStmt(stmt: Break): void {
    if (this.currentLoop == LoopType.NONE) {
      this.reportError(stmt.token, `Cannot break outside of loop`);
    }
    // nothing to resolve
  }

  visitCallExpr(expr: Call): void {
    this.resolve(expr.callee);

    for (const arg of expr.args) {
      this.resolve(arg);
    }
  }

  visitGroupingExpr(expr: Grouping): void {
    this.resolve(expr.expression);
  }

  visitLiteralExpr(expr: Literal): void {
    // no expression to resolve
  }

  visitLogicalExpr(expr: Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitUnaryExpr(expr: Unary): void {
    this.resolve(expr.right);
  }

  private declare(name: Token): void {
    const scope = this.scopes.current;
    if (scope == undefined) return;

    if (scope.has(name.lexeme)) {
      this.reportError(name, `Already a variable with name '${name.lexeme}' in this scope`);
    }

    // set the variable as false, to indicate that it is not defined
    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    const scope = this.scopes.current;
    if (scope == undefined) return;

    // set the variable to true, to indicate that it is defined and available
    scope.set(name.lexeme, true);
  }

  private beginScope(): void {
    this.scopes.start();
  }

  private endScope(): void {
    this.scopes.end();
  }

  private reportError(token: Token, message: string): ResolverError {
    this.error = true;

    if (token.type == TokenType.EOF) {
      report(token.line, ` at end`, message);
    } else {
      report(token.line, ` at '${token.lexeme}'`, message);
    }

    return new ResolverError(message);
  }
}
