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
    "Literal": [["Object", "value"],],
    "Unary": [["Token", "operator"], ["Expr", "right"]],
};
function defineClass(basename, types) {
    let classDef = "\n\n";
    classDef += `export class ${basename} extends Expr {\n`;
    let params = [];
    for (const [paramType, paramName] of types) {
        classDef += `  private ${paramName}: ${paramType};\n`;
        params.push(`${paramName}: ${paramType}`);
    }
    classDef += `\n`;
    classDef += `  constructor(${params.join(", ")}) {\n`;
    classDef += `    super();\n`;
    for (const [_, paramName] of types) {
        classDef += `    this.${paramName} = ${paramName};\n`;
    }
    classDef += `  }\n`;
    classDef += `}\n`;
    return classDef;
}
function writeAst(dirname) {
    return __awaiter(this, void 0, void 0, function* () {
        let dirDepth = dirname.split("/").map((base) => "..").join("/");
        let source = `import { Token } from "${dirDepth}/lox/token";\n\n`;
        source += `export class Expr {}\n`;
        for (const [name, types] of Object.entries(rules)) {
            let classDef = defineClass(name, types);
            source += classDef;
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
