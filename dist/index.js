"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.controllers = void 0;
var index_1 = require("./controllers/index");
Object.defineProperty(exports, "controllers", { enumerable: true, get: function () { return index_1.controllers; } });
Object.defineProperty(exports, "runCommand", { enumerable: true, get: function () { return index_1.runCommand; } });
__exportStar(require("./core/utils"), exports);
__exportStar(require("./core/index"), exports);
//# sourceMappingURL=index.js.map