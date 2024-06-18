"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAlphaNumeric = exports.isAlpha = exports.isDigit = void 0;
function isDigit(c) {
    return c >= "0" && c <= "9";
}
exports.isDigit = isDigit;
function isAlpha(c) {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
}
exports.isAlpha = isAlpha;
function isAlphaNumeric(c) {
    return isAlpha(c) || isDigit(c);
}
exports.isAlphaNumeric = isAlphaNumeric;
