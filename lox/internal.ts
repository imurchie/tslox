import { Environment } from "./environment";
import { Interpreter } from "./interfaces";
import { ReturnException, RuntimeError } from "./interpreter";
import { Func } from "./stmt";
import { Token } from "./token";

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
      environment.define(this.declaration.params[i], args[i]);
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

export class LoxInstance {
  private klass: LoxClass;
  private fields: Map<string, object> = new Map();

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  get(name: Token): object {
    if (this.fields.has(name.lexeme)) {
      const value = this.fields.get(name.lexeme);
      if (value != undefined) {
        return value;
      }
    }

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'`);
  }

  toString(): string {
    return `<instance ${this.klass.name} >`;
  }
}

export class LoxClass extends LoxCallable {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  call(interpreter: Interpreter, args: object[]): LoxReturnValue {
    const instance = new LoxInstance(this);
    return new LoxReturnValue(instance);
  }

  arity(): number {
    return 0;
  }

  toString(): string {
    return `<class ${this.name} >`;
  }
}
