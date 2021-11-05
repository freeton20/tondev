"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgVariants = exports.tondevHome = exports.tondevDone = exports.tondevInit = exports.nameInfo = exports.matchName = exports.Component = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const core_1 = require("@tonclient/core");
const lib_node_1 = require("@tonclient/lib-node");
var component_1 = require("./component");
Object.defineProperty(exports, "Component", { enumerable: true, get: function () { return component_1.Component; } });
function matchName(x, test) {
    test = (test || "").toLowerCase();
    return x.name === test || x.alias === test;
}
exports.matchName = matchName;
function nameInfo(x, namePrefix = "", aliasPrefix = "") {
    return x.alias ? `${namePrefix}${x.name}, ${aliasPrefix}${x.alias}` : `${namePrefix}${x.name}`;
}
exports.nameInfo = nameInfo;
const config = {
    home: path_1.default.resolve(os_1.default.homedir(), ".tondev")
};
function tondevInit(options) {
    var _a;
    core_1.TonClient.useBinaryLibrary(lib_node_1.libNode);
    config.home = (_a = options === null || options === void 0 ? void 0 : options.home) !== null && _a !== void 0 ? _a : config.home;
}
exports.tondevInit = tondevInit;
function tondevDone() {
    core_1.TonClient.default.close();
}
exports.tondevDone = tondevDone;
/**
 * Home directory where tool must store all tool related resources.
 */
function tondevHome() {
    return config.home;
}
exports.tondevHome = tondevHome;
async function getArgVariants(arg) {
    if (!arg.getVariants) {
        return undefined;
    }
    const variants = arg.getVariants();
    if (variants instanceof Promise) {
        return await variants;
    }
    return variants;
}
exports.getArgVariants = getArgVariants;
//# sourceMappingURL=index.js.map