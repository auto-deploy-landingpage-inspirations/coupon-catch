"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDataWithRegex = void 0;
function cleanDataWithRegex(text, regexPattern) {
    return text.replace(regexPattern, '');
}
exports.cleanDataWithRegex = cleanDataWithRegex;
