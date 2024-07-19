import { Environment } from "./environment";
import { Expr } from "./expr";
import { Stmt } from "./stmt";

export interface Interpreter {
  globals: Environment;
  environment: Environment;

  interpret(statements: Stmt[]): any;
  get error(): boolean;
  set error(error: boolean);

  executeBlock(statements: Stmt[], environment: Environment): void;

  resolve(expr: Expr, depth: number): void;
}
