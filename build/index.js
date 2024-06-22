#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const promises_1 = __importDefault(require("node:readline/promises"));
const promises_2 = require("node:fs/promises");
const scanner_1 = __importDefault(require("./lox/scanner"));
const parser_1 = __importDefault(require("./lox/parser"));
const ast_printer_1 = require("./lox/ast_printer");
function run(source) {
    console.log("running!");
    const scanner = new scanner_1.default(source);
    const tokens = scanner.scanTokens();
    for (const token of tokens) {
        console.log(token);
    }
    if (scanner.error) {
        console.log("Scanner error");
        return scanner.error;
    }
    //   return scanner.error;
    const parser = new parser_1.default(tokens);
    const expr = parser.parse();
    if (expr == null) {
        return parser.hasError;
    }
    console.log(new ast_printer_1.AstPrinter().print(expr));
    return parser.hasError;
}
function runFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Running file '${filename}'`);
        const source = yield (0, promises_2.readFile)(filename);
        if (!run(source.toString())) {
            process.exit(65);
        }
    });
}
function runPrompt() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`REPL`);
        const rl = promises_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        for (;;) {
            const line = yield rl.question(">>> ");
            if (!line) {
                continue;
            }
            run(line);
        }
        rl.close();
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        commander_1.program.parse();
        if (commander_1.program.args.length > 1) {
            console.log(commander_1.program.usage);
            process.exit(64);
        }
        else if (commander_1.program.args.length === 1) {
            yield runFile(commander_1.program.args[0]);
        }
        else {
            yield runPrompt();
        }
    });
}
main();
