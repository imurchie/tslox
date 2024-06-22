"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstPrinter = void 0;
const grammar_1 = require("./grammar");
class AstPrinter extends grammar_1.Visitor {
    print(expr) {
        return expr.accept(this);
    }
    visitBinaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }
    visitGroupingExpr(expr) {
        return this.parenthesize("group", expr.expression);
    }
    visitLiteralExpr(expr) {
        return expr.value == null ? "nil" : expr.value.toString();
    }
    visitUnaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }
    parenthesize(name, ...exprs) {
        let builder = `(${name}`;
        for (const expr of exprs) {
            builder += ` ${expr.accept(this)}`;
        }
        builder += `)`;
        return builder;
    }
}
exports.AstPrinter = AstPrinter;
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
