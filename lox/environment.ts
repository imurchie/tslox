import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export class Environment {
  private values: { [name: string]: object } = {};

  define(name: string, value: object): void {
    this.values[name] = value;
  }

  get(name: Token): object {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme];
    }
    throw new RuntimeError(name, `Getting undefined variable '${name.lexeme}'`);
  }

  assign(name: Token, value: object): void {
    if (name.lexeme in this.values) {
      this.values[name.lexeme] = value;
    }
    throw new RuntimeError(name, `Assigning to undefined variable '${name.lexeme}'`);
  }
}
