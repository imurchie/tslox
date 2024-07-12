import { Interpreter } from "./interfaces";
import { Func } from "./stmt";

// this should be an interface, but then checking that it is one when running
// it is not possible, afaict
export class LoxReturnValue {
  private value: any;
  constructor(value: any) {
    this.value = value;
  }
  valueOf(): any {
    return this.value;
  }
}

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

  constructor(declaration: Func) {
    super();
    this.declaration = declaration;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: object[]): LoxReturnValue {
    const environment = interpreter.globals;
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return new LoxReturnValue(undefined);
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme} >`;
  }
}
