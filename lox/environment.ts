import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export class Environment {
  private values: { [name: string]: object } = {};
  private enclosing: Environment | null = null;

  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing;
  }

  define(name: string, value: object): void {
    this.values[name] = value;
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
}
