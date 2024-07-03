#! /usr/bin/env node

/*
 * Generate the classes used for expression definitions.
 */

import { program } from "commander";
import { writeFile } from "node:fs/promises";

const RULES = {
  Expr: {
    Binary: [
      ["Expr", "left"],
      ["Token", "operator"],
      ["Expr", "right"],
    ],
    Grouping: [["Expr", "expression"]],
    Literal: [["any", "value"]],
    Unary: [
      ["Token", "operator"],
      ["Expr", "right"],
    ],
  },
  Stmt: {
    Expression: [["Expr", "expression"]],
    Print: [["Expr", "expression"]],
  },
};

function defineBaseClass(name: string): string {
  let classDef = `export class ${name} {\n`;
  classDef += `  accept<T>(visitor: Visitor<T>): T { // eslint-disable-line @typescript-eslint/no-unused-vars\n`;
  classDef += `    throw new Error("Abstract classes cannot be instantiated.");\n`;
  classDef += `  }\n`;
  classDef += `}\n`;

  return classDef;
}

function defineBaseVisitor(name: string, types: string[]): string {
  let classDef = `export interface Visitor<T> {\n`;
  for (const type of types) {
    classDef += `  visit${type}${name}(${name.toLowerCase()}: ${type}): T;\n`;
  }
  classDef += `}\n`;

  return classDef;
}

function defineClass(basename: string, name: string, types: string[][]): string {
  let classDef = "\n\n";
  classDef += `export class ${name} extends ${basename} {\n`;

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
  classDef += `    return visitor.visit${name}${basename}(this);\n`;
  classDef += `  }\n`;
  classDef += `}\n`;

  return classDef;
}

async function writeAst(dirname: string, basename: string, rules: { [key: string]: string[][] }) {
  const dirDepth = dirname
    .split("/")
    .map(() => "..")
    .join("/");
  let source = `import { Token } from "${dirDepth}/lox/token";  // eslint-disable-line @typescript-eslint/no-unused-vars\n`;
  if (basename != "Expr") {
    source += `import { Expr } from "${dirDepth}/lox/expr";\n`;
  }
  source += "\n\n";

  source += defineBaseClass(basename);
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
