#! /usr/bin/env node

/*
 * Generate the classes used for expression definitions.
 */

import { program } from "commander";
import { writeFile } from "node:fs/promises";

const RULES = {
  Expr: {
    Assign: [
      ["Token", "name"],
      ["Expr", "value"],
    ],
    Binary: [
      ["Expr", "left"],
      ["Token", "operator"],
      ["Expr", "right"],
    ],
    Call: [
      ["Expr", "callee"],
      ["Token", "paren"],
      ["Expr[]", "args"],
    ],
    Grouping: [["Expr", "expression"]],
    Literal: [["any", "value"]],
    Logical: [
      ["Expr", "left"],
      ["Token", "operator"],
      ["Expr", "right"],
    ],
    Unary: [
      ["Token", "operator"],
      ["Expr", "right"],
    ],
    Variable: [["Token", "name"]],
  },
  Stmt: {
    Block: [["Stmt[]", "statements"]],
    Break: [],
    Expression: [["Expr", "expression"]],
    Func: [
      ["Token", "name"],
      ["Token[]", "params"],
      ["Stmt[]", "body"],
    ],
    If: [
      ["Expr", "condition"],
      ["Stmt", "thenBranch"],
      ["Stmt | null", "elseBranch"],
    ],
    Print: [["Expr", "expression"]],
    Return: [
      ["Token", "keyword"],
      ["Expr", "value"],
    ],
    Var: [
      ["Token", "name"],
      ["Expr", "initializer"],
    ],
    While: [
      ["Expr", "condition"],
      ["Stmt", "body"],
    ],
  },
};

function addEslintComment(paramType: string): string {
  return paramType == "any" ? "// eslint-disable-line @typescript-eslint/no-explicit-any" : "";
}

function defineBaseInterface(name: string): string {
  let def = `export interface ${name} {\n`;
  def += `  accept<T>(visitor: Visitor<T>): T;\n`;
  def += `}\n`;

  return def;
}

function defineBaseVisitor(name: string, types: string[]): string {
  let def = `export interface Visitor<T> {\n`;
  for (const type of types) {
    def += `  visit${type}${name}(${name.toLowerCase()}: ${type}): T;\n`;
  }
  def += `}\n`;

  return def;
}

function defineClass(basename: string, name: string, types: string[][]): string {
  let classDef = "\n\n";
  classDef += `export class ${name} implements ${basename} {\n`;

  const params = [];
  let needEslintComment = false;
  let stringRep = `${name} {`;
  for (const [paramType, paramName] of types) {
    needEslintComment = needEslintComment || paramType == "any";
    classDef += `  ${paramName}: ${paramType}; ${addEslintComment(paramType)}\n`;
    params.push(`${paramName}: ${paramType}`);
    stringRep += ` ${paramName}: \$\{this.${paramName}\}`;
  }
  stringRep += ` }`;

  classDef += `\n`;
  classDef += `  constructor(${params.join(", ")}) {${addEslintComment(needEslintComment ? "any" : "")}\n`;
  for (const [, paramName] of types) {
    classDef += `    this.${paramName} = ${paramName};\n`;
  }
  classDef += `  }\n\n`;

  classDef += `  accept<T>(visitor: Visitor<T>): T {\n`;
  classDef += `    return visitor.visit${name}${basename}(this);\n`;
  classDef += `  }\n`;

  classDef += `\n`;

  classDef += `  toString(): string {\n`;
  classDef += `    return \`${stringRep}\`;\n`;
  classDef += `  }\n`;

  classDef += `}\n`;

  return classDef;
}

async function writeAst(dirname: string, basename: string, rules: { [key: string]: string[][] }) {
  const dirDepth = dirname
    .split("/")
    .map(() => "..")
    .join("/");

  let source = "/* This is a generated file. Do not manually edit! */\n\n\n";
  source += `import { Token } from "${dirDepth}/lox/token"; // eslint-disable-line @typescript-eslint/no-unused-vars\n`;
  if (basename != "Expr") {
    source += `import { Expr } from "${dirDepth}/lox/expr";\n`;
  }
  source += "\n\n";

  source += defineBaseInterface(basename);
  source += defineBaseVisitor(basename, Object.keys(rules));

  for (const [name, types] of Object.entries(rules)) {
    source += defineClass(basename, name, types);
  }

  await writeFile(`${dirname}/${basename.toLowerCase()}.ts`, source);
}

async function main() {
  program.parse();

  if (program.args.length != 1) {
    console.log(program.usage());
    process.exit(64);
  }
  for (const [name, rules] of Object.entries(RULES)) {
    await writeAst(program.args[0], name, rules);
  }
}

main();
