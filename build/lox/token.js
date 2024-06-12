"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    toString() {
        return `Token { type: ${this.type.toString()}, lexeme: ${this.lexeme}, literal: ${this.literal}, line: ${this.line} }`;
    }
}
exports.Token = Token;
