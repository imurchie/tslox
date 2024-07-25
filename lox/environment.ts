import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export class Environment {
  private values: { [name: string]: object } = {};
  private enclosing: Environment | null = null;

  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing;
  }

  define(name: Token | string, value: object): void {
    if (name instanceof Token) {
      name = name.lexeme;
    }
    this.values[name] = value;
  }

  ancestor(distance: number): Environment {
    let environment: Environment = this;

    for (let i = 0; i < distance; i++) {
      if (environment.enclosing == null) {
        // error
        break;
      }
      environment = environment.enclosing;
    }

    return environment;
  }

  get(name: Token): object {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme];
    }

    // go through enclosing scopes to see if we find anything
    if (this.enclosing != null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Getting undefined variable '${name.lexeme}'`);
  }

  getAt(distance: number, name: Token | string): object {
    if (name instanceof Token) {
      name = name.lexeme;
    }
    return this.ancestor(distance).values[name];
  }

  assign(name: Token, value: object): void {
    if (name.lexeme in this.values) {
      this.values[name.lexeme] = value;
      return;
    }

    // go through enclosing scopes to see if we find anything
    if (this.enclosing != null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Assigning to undefined variable '${name.lexeme}'`);
  }

  assignAt(distance: number, name: Token, value: object): void {
    this.ancestor(distance).values[name.lexeme] = value;
  }
}
