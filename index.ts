#! /usr/bin/env node

import { program } from "commander";
import readline from "node:readline/promises";
import { readFile } from "node:fs/promises";
import Scanner from "./lox/scanner";
import Parser from "./lox/parser";
import { LoxInterpreter } from "./lox/interpreter";
import { Resolver } from "./lox/resolver";

function run(source: string, interpreter: LoxInterpreter | null = null): any {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  // for (const token of tokens) {
  //   console.log(token);
  // }

  const parser = new Parser(tokens);
  const statements = parser.parse();

  interpreter = interpreter || new LoxInterpreter();

  const resolver = new Resolver(interpreter);
  resolver.resolve(statements);

  return interpreter.interpret(statements);
}

async function runFile(filename: string) {
  console.log(`Running file '${filename}'`);

  const source = await readFile(filename);
  try {
    run(source.toString());
  } catch (ex) {
    console.log(ex);
    process.exit(65);
  }
}

async function runPrompt() {
  console.log(`REPL`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const interpreter = new LoxInterpreter();
  try {
    for (;;) {
      const line = await rl.question(">>> ");
      if (!line) {
        continue;
      }
      try {
        console.log(run(line, interpreter));
      } catch (ex) {
        console.log(ex);
      }
    }
  } finally {
    rl.close();
  }
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
