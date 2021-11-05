"use strict";
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
    stdlib: new class extends core_1.Component {
        getSourceName(version) {
            return `${this.name}_${version.split(".").join("_")}.tvm.gz`;
        }
        async resolveVersion(downloadedVersion) {
            return downloadedVersion;
        }
        async loadAvailableVersions() {
            return exports.components.compiler.loadAvailableVersions();
        }
    }(TOOL_FOLDER_NAME, "stdlib_sol", {
        targetName: "stdlib_sol.tvm",
    }),
};
//# sourceMappingURL=components.js.map