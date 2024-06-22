"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_type_1 = require("./token_type");
const grammar_1 = require("./grammar");
const errors_1 = require("./errors");
class ParseError extends Error {
}
class Parser {
    constructor(tokens) {
        this.current = 0;
        this._hasError = false;
        this.tokens = tokens;
    }
    parse() {
        console.log("Parsing");
        try {
            return this.expression();
        }
        catch (ex) {
            console.log(ex);
            return null;
        }
    }
    get hasError() {
        return this._hasError;
    }
    set hasError(error) {
        this._hasError = error;
    }
    expression() {
        return this.equality();
    }
    equality() {
        let expr = this.comparison();
        while (this.match(token_type_1.TokenType.EQUAL, token_type_1.TokenType.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new grammar_1.Binary(expr, operator, right);
        }
        return expr;
    }
    comparison() {
        let expr = this.term();
        while (this.match(token_type_1.TokenType.GREATER, token_type_1.TokenType.GREATER_EQUAL, token_type_1.TokenType.LESS, token_type_1.TokenType.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = new grammar_1.Binary(expr, operator, right);
        }
        return expr;
    }
    term() {
        let expr = this.factor();
        while (this.match(token_type_1.TokenType.MINUS, token_type_1.TokenType.PLUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new grammar_1.Binary(expr, operator, right);
        }
        return expr;
    }
    factor() {
        let expr = this.unary();
        while (this.match(token_type_1.TokenType.SLASH, token_type_1.TokenType.STAR)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new grammar_1.Binary(expr, operator, right);
        }
        return expr;
    }
    unary() {
        if (this.match(token_type_1.TokenType.BANG, token_type_1.TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new grammar_1.Unary(operator, right);
        }
        return this.primary();
    }
    primary() {
        if (this.match(token_type_1.TokenType.FALSE))
            return new grammar_1.Literal(false);
        if (this.match(token_type_1.TokenType.TRUE))
            return new grammar_1.Literal(true);
        if (this.match(token_type_1.TokenType.NIL))
            return new grammar_1.Literal(null);
        if (this.match(token_type_1.TokenType.NUMBER, token_type_1.TokenType.STRING)) {
            return new grammar_1.Literal(this.previous().literal);
        }
        if (this.match(token_type_1.TokenType.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(token_type_1.TokenType.RIGHT_PAREN, `Expect ')' after expression`);
            return new grammar_1.Grouping(expr);
        }
        throw this.error(this.peek(), "Expect expression");
    }
    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type == token_type_1.TokenType.SEMICOLON)
                return;
            switch (this.peek().type) {
                case token_type_1.TokenType.CLASS:
                case token_type_1.TokenType.FUN:
                case token_type_1.TokenType.VAR:
                case token_type_1.TokenType.FOR:
                case token_type_1.TokenType.IF:
                case token_type_1.TokenType.WHILE:
                case token_type_1.TokenType.PRINT:
                case token_type_1.TokenType.RETURN:
                    return;
            }
            this.advance();
        }
    }
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type == type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type == token_type_1.TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        throw this.error(this.peek(), message);
    }
    error(token, message) {
        this.hasError = true;
        if (token.type == token_type_1.TokenType.EOF) {
            (0, errors_1.report)(token.line, ` at end`, message);
        }
        else {
            (0, errors_1.report)(token.line, ` at '${token.lexeme}'`, message);
        }
        return new ParseError(message);
    }
}
exports.default = Parser;
