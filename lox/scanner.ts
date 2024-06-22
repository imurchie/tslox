import { Token } from "./token";
import { TokenType } from "./token_type";
import { error } from "./errors";
import { isAlpha, isAlphaNumeric, isDigit } from "./utils";
import keywords from "./keywords";

export default class Scanner {
  private source: string;
  private tokens: Token[];

  private start = 0;
  private current = 0;
  private line = 1;

  private hasError = false;

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
  }

  get error(): boolean {
    return this.hasError;
  }

  set error(error: boolean) {
    this.hasError = error;
  }

  scanTokens(): Token[] {
    console.log("Scanning");

    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    // add sentinel for future parsing
    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));

    return this.tokens;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN, null);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN, null);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE, null);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE, null);
        break;
      case ",":
        this.addToken(TokenType.COMMA, null);
        break;
      case ".":
        this.addToken(TokenType.DOT, null);
        break;
      case "-":
        this.addToken(TokenType.MINUS, null);
        break;
      case "+":
        this.addToken(TokenType.PLUS, null);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON, null);
        break;
      case "*":
        this.addToken(TokenType.STAR, null);
        break;

      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG, null);
        break;
      case "=":
        this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL, null);
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.EQUAL, null);
        break;
      case ">":
        this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER, null);
        break;
      case "/":
        if (this.match("/")) {
          // this is a comment, so consume the entire line but add no token
          while (this.peek() != "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH, null);
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
        if (isDigit(c)) {
          this.number();
        } else if (isAlpha(c)) {
          this.identifier();
        } else {
          error(this.line, `Unexpected character '${c}'`);
          this.hasError = true;
        }
        break;
    }
  }

  addToken(tokenType: string, literal: string | number | null) {
    if (literal == undefined) {
      literal = null;
    }
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(tokenType, text, literal, this.line));
  }

  advance(): string {
    return this.source[this.current++];
  }

  peek(): string {
    if (this.isAtEnd()) {
      return "\0";
    }
    return this.source[this.current];
  }

  peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }
    return this.source[this.current + 1];
  }

  match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source[this.current] != expected) {
      return false;
    }

    this.current++;
    return true;
  }

  isAtEnd(): boolean {
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
      error(this.line, `Unterminated string`);
      return;
    }

    // consume the closing quotation mark
    this.advance();

    // trim quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  number() {
    while (isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() == "." && isDigit(this.peekNext())) {
      this.advance();
      while (isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(TokenType.NUMBER, Number(this.source.substring(this.start, this.current)));
  }

  identifier() {
    while (isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    const type = keywords.get(text) || TokenType.IDENTIFIER;

    this.addToken(type, text);
  }
}
