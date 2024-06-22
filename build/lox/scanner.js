"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("./token");
const token_type_1 = require("./token_type");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const keywords_1 = __importDefault(require("./keywords"));
class Scanner {
    constructor(source) {
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.hasError = false;
        this.source = source;
        this.tokens = [];
    }
    get error() {
        return this.hasError;
    }
    set error(error) {
        this.hasError = error;
    }
    scanTokens() {
        console.log("Scanning");
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        // add sentinel for future parsing
        this.tokens.push(new token_1.Token(token_type_1.TokenType.EOF, "", null, this.line));
        return this.tokens;
    }
    scanToken() {
        const c = this.advance();
        switch (c) {
            case "(":
                this.addToken(token_type_1.TokenType.LEFT_PAREN, null);
                break;
            case ")":
                this.addToken(token_type_1.TokenType.RIGHT_PAREN, null);
                break;
            case "{":
                this.addToken(token_type_1.TokenType.LEFT_BRACE, null);
                break;
            case "}":
                this.addToken(token_type_1.TokenType.RIGHT_BRACE, null);
                break;
            case ",":
                this.addToken(token_type_1.TokenType.COMMA, null);
                break;
            case ".":
                this.addToken(token_type_1.TokenType.DOT, null);
                break;
            case "-":
                this.addToken(token_type_1.TokenType.MINUS, null);
                break;
            case "+":
                this.addToken(token_type_1.TokenType.PLUS, null);
                break;
            case ";":
                this.addToken(token_type_1.TokenType.SEMICOLON, null);
                break;
            case "*":
                this.addToken(token_type_1.TokenType.STAR, null);
                break;
            case "!":
                this.addToken(this.match("=") ? token_type_1.TokenType.BANG_EQUAL : token_type_1.TokenType.BANG, null);
                break;
            case "=":
                this.addToken(this.match("=") ? token_type_1.TokenType.EQUAL_EQUAL : token_type_1.TokenType.EQUAL, null);
                break;
            case "<":
                this.addToken(this.match("=") ? token_type_1.TokenType.LESS_EQUAL : token_type_1.TokenType.EQUAL, null);
                break;
            case ">":
                this.addToken(this.match("=") ? token_type_1.TokenType.GREATER_EQUAL : token_type_1.TokenType.GREATER, null);
                break;
            case "/":
                if (this.match("/")) {
                    // this is a comment, so consume the entire line but add no token
                    while (this.peek() != "\n" && !this.isAtEnd()) {
                        this.advance();
                    }
                }
                else {
                    this.addToken(token_type_1.TokenType.SLASH, null);
                }
                break;
            // whitespace
            case " ":
            case "\r":
            case "\t":
                // ignore
                break;
            case "\n":
                this.line++;
                break;
            // string literals
            case '"':
                this.string();
                break;
            default:
                // number literals
                if ((0, utils_1.isDigit)(c)) {
                    this.number();
                }
                else if ((0, utils_1.isAlpha)(c)) {
                    this.identifier();
                }
                else {
                    (0, errors_1.error)(this.line, `Unexpected character '${c}'`);
                    this.hasError = true;
                }
                break;
        }
    }
    addToken(tokenType, literal) {
        if (literal == undefined) {
            literal = null;
        }
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new token_1.Token(tokenType, text, literal, this.line));
    }
    advance() {
        return this.source[this.current++];
    }
    peek() {
        if (this.isAtEnd()) {
            return "\0";
        }
        return this.source[this.current];
    }
    peekNext() {
        if (this.current + 1 >= this.source.length) {
            return "\0";
        }
        return this.source[this.current + 1];
    }
    match(expected) {
        if (this.isAtEnd()) {
            return false;
        }
        if (this.source[this.current] != expected) {
            return false;
        }
        this.current++;
        return true;
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == "\n") {
                this.line++;
            }
            this.advance();
        }
        if (this.isAtEnd()) {
            (0, errors_1.error)(this.line, `Unterminated string`);
            return;
        }
        // consume the closing quotation mark
        this.advance();
        // trim quotes
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(token_type_1.TokenType.STRING, value);
    }
    number() {
        while ((0, utils_1.isDigit)(this.peek())) {
            this.advance();
        }
        if (this.peek() == "." && (0, utils_1.isDigit)(this.peekNext())) {
            this.advance();
            while ((0, utils_1.isDigit)(this.peek())) {
                this.advance();
            }
        }
        this.addToken(token_type_1.TokenType.NUMBER, Number(this.source.substring(this.start, this.current)));
    }
    identifier() {
        while ((0, utils_1.isAlphaNumeric)(this.peek())) {
            this.advance();
        }
        const text = this.source.substring(this.start, this.current);
        const type = keywords_1.default.get(text) || token_type_1.TokenType.IDENTIFIER;
        this.addToken(type, text);
    }
}
exports.default = Scanner;
