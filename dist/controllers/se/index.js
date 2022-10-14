"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SE = void 0;
const commands_1 = require("./commands");
exports.SE = {
    name: "se",
    title: "TON OS SE",
    commands: [
        commands_1.seInfoCommand,
        commands_1.seVersionCommand,
        commands_1.seUpdateCommand,
        commands_1.seSetCommand,
        commands_1.seStartCommand,
        commands_1.seStopCommand,
        commands_1.seResetCommand,
        commands_1.seDeleteCommand,
    ],
};
//# sourceMappingURL=index.js.map