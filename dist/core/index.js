"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgVariants = exports.everdevHome = exports.everdevDone = exports.everdevInit = exports.nameInfo = exports.matchName = exports.Component = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const core_1 = require("@eversdk/core");
const lib_node_1 = require("@eversdk/lib-node");
var component_1 = require("./component");
Object.defineProperty(exports, "Component", { enumerable: true, get: function () { return component_1.Component; } });
function matchName(x, test) {
    test = (test || "").toLowerCase();
    return x.name === test || x.alias === test;
}
exports.matchName = matchName;
function nameInfo(x, namePrefix = "", aliasPrefix = "") {
    return x.alias
        ? `${namePrefix}${x.name}, ${aliasPrefix}${x.alias}`
        : `${namePrefix}${x.name}`;
}
exports.nameInfo = nameInfo;
const config = {
    home: path_1.default.resolve(os_1.default.homedir(), ".everdev"),
};
function everdevInit(options) {
    var _a;
    core_1.TonClient.useBinaryLibrary(lib_node_1.libNode);
    config.home = (_a = options === null || options === void 0 ? void 0 : options.home) !== null && _a !== void 0 ? _a : config.home;
}
exports.everdevInit = everdevInit;
function everdevDone() {
    core_1.TonClient.default.close();
}
exports.everdevDone = everdevDone;
/**
 * Home directory where tool must store all tool related resources.
 */
function everdevHome() {
    return config.home;
}
exports.everdevHome = everdevHome;
function getArgVariants(arg) {
    return __awaiter(this, void 0, void 0, function* () {
        return arg.getVariants === undefined ? undefined : arg.getVariants();
    });
}
exports.getArgVariants = getArgVariants;
//# sourceMappingURL=index.js.map