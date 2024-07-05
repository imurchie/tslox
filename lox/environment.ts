import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export class Environment {
    private values: {[name: string]: object} = {};

    define(name: string, value: object): void {
        this.values[name] = value;
    }

    get(name: Token): object {
        if (name.lexeme in this.values) {
            return this.values[name.lexeme];
        }
        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'`);
    }
}