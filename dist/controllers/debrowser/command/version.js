"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionCommand = void 0;
const installer_1 = require("../installer");
exports.versionCommand = {
    name: "version",
    title: "Show DeBrowser Versions",
    async run(terminal, _args) {
        terminal.log(`Available Versions: ${(await (0, installer_1.getAvailableVersions)()).join(", ")}`);
    },
};
//# sourceMappingURL=version.js.map