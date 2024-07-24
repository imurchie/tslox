import { Environment } from "./environment";
import { Interpreter } from "./interfaces";
import { ReturnException, RuntimeError } from "./interpreter";
import { Func } from "./stmt";
import { Token } from "./token";
import { TokenType } from "./token_type";

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

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define(TokenType.THIS, instance);
    return new LoxFunction(this.declaration, environment);
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

    const method = this.klass.findMethod(name.lexeme);
    if (method) {
      return method.bind(this);
    }

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'`);
  }

  set(name: Token, value: object): void {
    this.fields.set(name.lexeme, value);
  }

  toString(): string {
    return `<instance ${this.klass.name} >`;
  }
}

export class LoxClass extends LoxCallable {
  name: string;
  methods: Map<string, LoxFunction>;

  constructor(name: string, methods: Map<string, LoxFunction>) {
    super();
    this.name = name;
    this.methods = methods;
  }

  findMethod(name: string): LoxFunction | undefined {
    const method = this.methods.get(name);

    return method;
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
