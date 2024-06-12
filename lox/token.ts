export class Token {
  type: string;
  lexeme: string;
  literal: string | number | null;
  line: number;

  constructor(type: string, lexeme: string, literal: string | number | null, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `Token { type: ${this.type.toString()}, lexeme: ${this.lexeme}, literal: ${this.literal}, line: ${this.line} }`;
  }
}
