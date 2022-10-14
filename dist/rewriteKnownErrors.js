"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteKnownErrors = void 0;
function rewriteKnownErrors(err) {
    let presumableError = "";
    if (err instanceof Error) {
        if (/dyld: Symbol not found/.test(err.message)) {
            presumableError = "Wrong Mac OS version";
        }
        if (presumableError !== "") {
            err.message = `${presumableError} (presumably)\nOriginal error:${err.message}`;
        }
    }
    return err;
}
exports.rewriteKnownErrors = rewriteKnownErrors;
//# sourceMappingURL=rewriteKnownErrors.js.map