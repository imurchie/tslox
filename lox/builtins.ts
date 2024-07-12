import { Interpreter } from "./interfaces";
import { LoxCallable, LoxReturnValue } from "./internal";

export class ClockBuiltin extends LoxCallable {
  arity(): number {
    return 0;
  }

  call(interpreter: Interpreter, args: object[]): LoxReturnValue {
    return new LoxReturnValue(Date.now() / 1000);
  }

  toString(): string {
    return "<native fn>";
  }
}
