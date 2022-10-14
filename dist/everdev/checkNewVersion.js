"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdateIsAvailableMsg = exports.createLatestVerFile = void 0;
const path = __importStar(require("path"));
const index_1 = require("../core/index");
const utils_1 = require("../core/utils");
const LAST_RUN_FILE = ".lastrun";
const LATEST_VERSION_FILE = ".latest";
/*
 * Checks if this is the first run in the last 24 hours
 * and touches the LAST_RUN_FILE
 */
function isFirstRun() {
    const lastrunFile = path.resolve((0, index_1.everdevHome)(), LAST_RUN_FILE);
    const lastrunTS = (0, utils_1.touch)(lastrunFile);
    return !lastrunTS || lastrunTS.getTime() < Date.now() - 24 * 3600 * 1000;
}
function createLatestVerFile(pkgName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isFirstRun()) {
            const version = yield (0, utils_1.getLatestFromNmp)(pkgName);
            (0, utils_1.writeTextFile)(path.resolve((0, index_1.everdevHome)(), LATEST_VERSION_FILE), version);
        }
    });
}
exports.createLatestVerFile = createLatestVerFile;
function getUpdateIsAvailableMsg(pkgName, pkgVer) {
    const latestVer = (0, utils_1.readTextFileSyncOnce)(path.resolve((0, index_1.everdevHome)(), LATEST_VERSION_FILE));
    if (latestVer && (0, utils_1.compareVersions)(latestVer, pkgVer) > 0) {
        const sep = "********************************************";
        return [
            "",
            sep,
            `A new version of ${pkgName} ${latestVer} is available!`,
            sep,
            `Installed version is ${pkgVer}`,
            `Update it with "npm update ${pkgName}"`,
            "",
        ].join("\n");
    }
    else {
        return "";
    }
}
exports.getUpdateIsAvailableMsg = getUpdateIsAvailableMsg;
//# sourceMappingURL=checkNewVersion.js.map