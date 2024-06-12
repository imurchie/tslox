"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_type_1 = require("./token_type");
exports.default = new Map([
    ["and", token_type_1.TokenType.AND],
    ["class", token_type_1.TokenType.CLASS],
    ["else", token_type_1.TokenType.ELSE],
    ["false", token_type_1.TokenType.FALSE],
    ["for", token_type_1.TokenType.FOR],
    ["fun", token_type_1.TokenType.FUN],
    ["if", token_type_1.TokenType.IF],
    ["nil", token_type_1.TokenType.NIL],
    ["or", token_type_1.TokenType.OR],
    ["print", token_type_1.TokenType.PRINT],
    ["return", token_type_1.TokenType.RETURN],
    ["super", token_type_1.TokenType.SUPER],
    ["this", token_type_1.TokenType.THIS],
    ["true", token_type_1.TokenType.TRUE],
    ["var", token_type_1.TokenType.VAR],
    ["while", token_type_1.TokenType.WHILE],
]);
