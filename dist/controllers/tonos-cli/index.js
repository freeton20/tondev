"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TONOS = exports.tonosVersionCommand = exports.tonosUpdateCommand = exports.tonosSetCommand = exports.tonosInstallCommand = void 0;
const core_1 = require("../../core");
const components_1 = require("./components");
exports.tonosInstallCommand = {
    name: "install",
    title: "Install latest stable TON OS CLI",
    args: [],
    async run(terminal) {
        await core_1.Component.ensureInstalledAll(terminal, components_1.components);
    },
};
exports.tonosSetCommand = {
    name: "set",
    title: "Change installed version",
    args: [
        {
            name: "version",
            title: "version to install (e.g. 0.8.1 or latest)",
            type: "string",
            defaultValue: "latest",
        },
    ],
    async run(terminal, args) {
        await core_1.Component.setVersions(terminal, false, components_1.components, {
            tonoscli: args.version,
        });
    },
};
exports.tonosUpdateCommand = {
    name: "update",
    title: "Update to the latest version",
    async run(terminal, _args) {
        await core_1.Component.updateAll(terminal, false, components_1.components);
    },
};
exports.tonosVersionCommand = {
    name: "version",
    title: "Show installed and available versions",
    async run(terminal, _args) {
        terminal.log(await core_1.Component.getInfoAll(components_1.components));
    },
};
exports.TONOS = {
    name: "tonos-cli",
    title: "TON OS CLI",
    commands: [
        exports.tonosInstallCommand,
        exports.tonosSetCommand,
        exports.tonosVersionCommand,
        exports.tonosUpdateCommand,
    ],
};
//# sourceMappingURL=index.js.map