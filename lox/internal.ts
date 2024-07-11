export class LoxCallable {
  arity(): number {
    throw new Error("Base class");
  }
  call(args: object[]): LoxReturnValue {
    throw new Error("Base class");
  }
}

export class LoxReturnValue {
  private value: any;
  constructor(value: any) {
    this.value = value;
  }
  valueOf() {
    return this.value;
  }
}
