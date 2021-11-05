"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeBrowser = void 0;
const version_1 = require("./command/version");
const start_1 = require("./command/start");
const stop_1 = require("./command/stop");
const interfaces_1 = require("./command/interfaces");
exports.DeBrowser = {
    name: "debrowser",
    title: "ExtraTON Debot Browser",
    commands: [
        version_1.versionCommand,
        start_1.startCommand,
        stop_1.stopCommand,
        interfaces_1.interfacesCommand,
    ],
};
//# sourceMappingURL=index.js.map