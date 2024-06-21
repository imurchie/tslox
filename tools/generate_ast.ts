#! /usr/bin/env node

/*
 * Generate the classes used for expression definitions.
 */

import { program } from "commander";
import { writeFile } from "node:fs/promises";

const rules = {
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
};

function defineBaseClass(): string {
  let classDef = `export class Expr {\n`;
  classDef += `  accept<T>(visitor: Visitor<T>): T { // eslint-disable-line @typescript-eslint/no-unused-vars\n`;
  classDef += `    throw new Error("Abstract classes cannot be instantiated.");\n`;
  classDef += `  }\n`;
  classDef += `}\n`;

  return classDef;
}

function defineBaseVisitor(basename: string, types: string[]): string {
  let classDef = `export abstract class Visitor<T> {\n`;
  for (const type of types) {
    classDef += `  visit${type}${basename}(expr: ${type}): T { // eslint-disable-line @typescript-eslint/no-unused-vars\n`;
    classDef += `    throw new Error("Abstract classes cannot be instantiated.");\n`;
    classDef += `  }\n\n`;
  }
  classDef += `}\n`;

  return classDef;
}

function defineClass(basename: string, types: string[][]): string {
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

async function writeAst(dirname: string) {
  const dirDepth = dirname
    .split("/")
    .map(() => "..")
    .join("/");
  let source = `import { Token } from "${dirDepth}/lox/token";\n\n`;
  source += defineBaseClass();
  source += defineBaseVisitor("Expr", Object.keys(rules));

  for (const [name, types] of Object.entries(rules)) {
    source += defineClass(name, types);
  }

  await writeFile(`${dirname}/grammar.ts`, source);
}

async function main() {
  program.parse();

  if (program.args.length != 1) {
    console.log(program.usage);
    process.exit(64);
  }
  await writeAst(program.args[0]);
}

main();
