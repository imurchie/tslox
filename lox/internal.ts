import { Environment } from "./environment";
import { Interpreter } from "./interfaces";
import { ReturnException } from "./interpreter";
import { Func } from "./stmt";

export class LoxReturnValue {
  private value: any;
  constructor(value: any) {
    this.value = value;
  }

  valueOf(): any {
    const value = this.value != undefined ? this.value : null;
    return this.value;
  }
}

// this should be an interface, but then checking that it is one when running
// it is not possible, afaict
export class LoxCallable {
  arity(): number {
    throw new Error("Base class");
  }

  call(interpreter: Interpreter, args: object[]): LoxReturnValue {
    throw new Error("Base class");
  }
}

export class LoxFunction extends LoxCallable {
  private declaration: Func;
  private closure: Environment;

  constructor(declaration: Func, closure: Environment) {
    super();
    this.declaration = declaration;
    this.closure = closure;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: object[]): LoxReturnValue {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (ex) {
      if (ex instanceof ReturnException) {
        const value = ex.value == null ? undefined : ex.value.valueOf();
        return new LoxReturnValue(value);
      }
      throw ex;
    }
    return new LoxReturnValue(undefined);
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme} >`;
  }
}
