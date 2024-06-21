#! /usr/bin/env node
"use strict";
/*
 * Generate the classes used for expression definitions.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const promises_1 = require("node:fs/promises");
const rules = {
    "Binary": [["Expr", "left"], ["Token", "operator"], ["Expr", "right"]],
    "Grouping": [["Expr", "expression"],],
    "Literal": [["any", "value"],],
    "Unary": [["Token", "operator"], ["Expr", "right"]],
};
function defineBaseClass() {
    let classDef = `export class Expr {\n`;
    classDef += `  accept<T>(visitor: Visitor<T>): T { // eslint-disable-line @typescript-eslint/no-unused-vars\n`;
    classDef += `    throw new Error("Abstract classes cannot be instantiated.");\n`;
    classDef += `  }\n`;
    classDef += `}\n`;
    return classDef;
}
function defineBaseVisitor(basename, types) {
    let classDef = `export abstract class Visitor<T> {\n`;
    for (const type of types) {
        classDef += `  visit${type}${basename}(expr: ${type}): T { // eslint-disable-line @typescript-eslint/no-unused-vars\n`;
        classDef += `    throw new Error("Abstract classes cannot be instantiated.");\n`;
        classDef += `  }\n\n`;
    }
    classDef += `}\n`;
    return classDef;
}
function defineClass(basename, types) {
    let classDef = "\n\n";
    classDef += `export class ${basename} extends Expr {\n`;
    const params = [];
    for (const [paramType, paramName] of types) {
        classDef += `  ${paramName}: ${paramType}; // eslint-disable-line @typescript-eslint/no-explicit-any\n`;
        params.push(`${paramName}: ${paramType}`);
    }
    classDef += `\n`;
    classDef += `  constructor(${params.join(", ")}) { // eslint-disable-line @typescript-eslint/no-explicit-any\n`;
    classDef += `    super();\n`;
    for (const [, paramName] of types) {
        classDef += `    this.${paramName} = ${paramName};\n`;
    }
    classDef += `  }\n\n`;
    classDef += `  accept<T>(visitor: Visitor<T>): T {\n`;
    classDef += `    return visitor.visit${basename}Expr(this);\n`;
    classDef += `  }\n`;
    classDef += `}\n`;
    return classDef;
}
function writeAst(dirname) {
    return __awaiter(this, void 0, void 0, function* () {
        const dirDepth = dirname.split("/").map(() => "..").join("/");
        let source = `import { Token } from "${dirDepth}/lox/token";\n\n`;
        source += defineBaseClass();
        source += defineBaseVisitor("Expr", Object.keys(rules));
        for (const [name, types] of Object.entries(rules)) {
            source += defineClass(name, types);
        }
        yield (0, promises_1.writeFile)(`${dirname}/grammar.ts`, source);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        commander_1.program.parse();
        if (commander_1.program.args.length != 1) {
            console.log(commander_1.program.usage);
            process.exit(64);
        }
        yield writeAst(commander_1.program.args[0]);
    });
}
main();
