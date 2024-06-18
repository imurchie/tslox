"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstPrinter = void 0;
const grammar_1 = require("./grammar");
const token_1 = require("./token");
const token_type_1 = require("./token_type");
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
const expression = new grammar_1.Binary(new grammar_1.Unary(new token_1.Token(token_type_1.TokenType.MINUS, "-", null, 1), new grammar_1.Literal(123)), new token_1.Token(token_type_1.TokenType.STAR, "*", null, 1), new grammar_1.Grouping(new grammar_1.Literal(45.67)));
console.log(new AstPrinter().print(expression));
