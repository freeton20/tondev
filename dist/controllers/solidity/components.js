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
Object.defineProperty(exports, "__esModule", { value: true });
exports.components = void 0;
const core_1 = require("../../core");
const TOOL_FOLDER_NAME = "solidity";
exports.components = {
    compiler: new core_1.Component(TOOL_FOLDER_NAME, "solc", {
        isExecutable: true,
    }),
    linker: new core_1.Component(TOOL_FOLDER_NAME, "tvm_linker", {
        isExecutable: true,
        resolveVersionRegExp: /[^0-9]*([0-9.]+)/,
    }),
    stdlib: new (class extends core_1.Component {
        getSourceName(version) {
            return `${this.name}_${version.split(".").join("_")}.tvm.gz`;
        }
        resolveVersion(downloadedVersion) {
            return __awaiter(this, void 0, void 0, function* () {
                return downloadedVersion;
            });
        }
        loadAvailableVersions() {
            return __awaiter(this, void 0, void 0, function* () {
                return exports.components.compiler.loadAvailableVersions();
            });
        }
    })(TOOL_FOLDER_NAME, "stdlib_sol", {
        targetName: "stdlib_sol.tvm",
        hidden: true,
    }),
};
//# sourceMappingURL=components.js.map