"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.components = void 0;
const core_1 = require("../../core");
const TOOL_FOLDER_NAME = "tonos-cli";
exports.components = {
    tonoscli: new class extends core_1.Component {
        getSourceName(version) {
            return `tonos-cli-${version.split(".").join("_")}-{p}.zip`;
        }
    }(TOOL_FOLDER_NAME, "tonos-cli", {
        resolveVersionRegExp: /tonos_cli\s+([0-9.]+)/,
        isExecutable: true,
        runGlobally: true,
    }),
};
//# sourceMappingURL=components.js.map