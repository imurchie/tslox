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
import { Block, Break, Expression, Func, If, Print, Return, Stmt, Visitor as StmtVisitor, Var, While } from "./stmt";
import { Token } from "./token";

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

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private interpreter: Interpreter;
  private scopes = new ScopeStack();

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
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
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes.get(i)?.has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  private resolveFunction(stmt: Func): void {
    this.beginScope();
    for (const param of stmt.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(stmt.body);
    this.endScope();
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
      // error
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
    this.resolveFunction(stmt);
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
    if (stmt.value != null) {
      this.resolve(stmt.value);
    }
  }

  visitWhileStmt(stmt: While): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  visitBinaryExpr(expr: Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitBreakStmt(stmt: Break): void {
    // no expression to resolve
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
}
