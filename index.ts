#! /usr/bin/env node

import { program } from "commander";
import readline from "node:readline/promises";
import { readFile } from "node:fs/promises";
import Scanner from "./lox/scanner";
import Parser from "./lox/parser";
import { AstPrinter } from "./lox/ast_printer";

function run(source: string): boolean {
  console.log("running!");
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  for (const token of tokens) {
    console.log(token);
  }

  if (scanner.error) {
    console.log("Scanner error");
    return scanner.error;
  }

  //   return scanner.error;
  const parser = new Parser(tokens);
  const expr = parser.parse();
  if (expr == null) {
    return parser.hasError;
  }
  console.log(new AstPrinter().print(expr));

  return parser.hasError;
}

async function runFile(filename: string) {
  console.log(`Running file '${filename}'`);

  const source = await readFile(filename);
  if (!run(source.toString())) {
    process.exit(65);
  }
}

async function runPrompt() {
  console.log(`REPL`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (;;) {
    const line = await rl.question(">>> ");
    if (!line) {
      continue;
    }
    run(line);
  }
  rl.close();
}

async function main() {
  program.parse();

  if (program.args.length > 1) {
    console.log(program.usage);
    process.exit(64);
  } else if (program.args.length === 1) {
    await runFile(program.args[0]);
  } else {
    await runPrompt();
  }
}

main();
