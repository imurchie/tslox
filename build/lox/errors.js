"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.report = exports.error = void 0;
function error(line, message) {
    report(line, "", message);
}
exports.error = error;
function report(line, where, message) {
    console.log(`[${line}] Error${where}: ${message}`);
}
exports.report = report;
