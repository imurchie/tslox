#! /usr/bin/env node

/*
 * Generate the classes used for expression definitions.
 */

import { program } from "commander";
import { writeFile } from "node:fs/promises";


const rules = {
    "Binary": [["Expr", "left"], ["Token", "operator"], ["Expr", "right"]],
    "Grouping": [["Expr", "expression"], ],
    "Literal": [["Object", "value"], ],
    "Unary": [["Token", "operator"], ["Expr", "right"]],
};


function defineClass(basename: string, types: string[][]): string {
  let classDef = "\n\n";
  classDef += `export class ${basename} extends Expr {\n`;

  let params = []
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
  return classDef
}


async function writeAst(dirname: string) {
  let dirDepth = dirname.split("/").map((base) => "..").join("/");
  let source = `import { Token } from "${dirDepth}/lox/token";\n\n`;
  source += `export class Expr {}\n`;
  for (const [name, types] of Object.entries(rules)) {
      let classDef = defineClass(name, types)
      source += classDef;
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