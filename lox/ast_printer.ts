import {
  Assign,
  Binary,
  Call,
  Expr,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  This,
  Unary,
  Variable,
  Visitor,
} from "./expr";

export class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    return expr.value == null ? "nil" : expr.value.toString();
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  visitVariableExpr(expr: Variable): string {
    return `var ${expr.name}`;
  }

  visitAssignExpr(expr: Assign): string {
    return `${expr.name} = ${expr.value}`;
  }

  visitLogicalExpr(expr: Logical): string {
    return `${expr.left} ${expr.operator} ${expr.right}`;
  }

  visitCallExpr(expr: Call): string {
    return `${expr.callee}`;
  }

  visitGetExpr(expr: Get): string {
    return `${expr}`;
  }

  visitSetExpr(expr: Set): string {
    return expr.toString();
  }

  visitThisExpr(expr: This): string {
    return expr.toString();
  }

  visitSuperExpr(expr: Super): string {
    return expr.toString();
  }

  parenthesize(name: string, ...exprs: Expr[]): string {
    let builder = `(${name}`;
    for (const expr of exprs) {
      builder += ` ${expr.accept(this)}`;
    }
    builder += `)`;

    return builder;
  }
}

// const expression = new Binary(
//     new Unary(
//         new Token(TokenType.MINUS, "-", null, 1),
//         new Literal(123)
//     ),
//     new Token(TokenType.STAR, "*", null, 1),
//     new Grouping(
//         new Literal(45.67)
//     )
// )
// console.log(new AstPrinter().print(expression));
