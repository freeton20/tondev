"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printSummaryInfo = void 0;
const controllers_1 = require("../controllers");
function findInfoCommand(controller, name) {
    var _a;
    if (controller.name === "contract" && name === "info") {
        return undefined;
    }
    const command = controller.commands.find(x => x.name == name);
    if (!command) {
        return undefined;
    }
    const args = {};
    for (const arg of (_a = command.args) !== null && _a !== void 0 ? _a : []) {
        if (arg.defaultValue === undefined) {
            return undefined;
        }
        args[arg.name] = arg.defaultValue;
    }
    return {
        command,
        args,
    };
}
async function printSummaryInfo(terminal) {
    var _a, _b;
    for (const controller of controllers_1.controllers) {
        const info = (_b = (_a = findInfoCommand(controller, "info")) !== null && _a !== void 0 ? _a : findInfoCommand(controller, "list")) !== null && _b !== void 0 ? _b : findInfoCommand(controller, "version");
        if (info) {
            terminal.log();
            terminal.log(controller.title);
            terminal.log();
            try {
                await info.command.run(terminal, info.args);
            }
            catch (error) {
                terminal.writeError(`${error}`);
            }
        }
    }
    terminal.log();
}
exports.printSummaryInfo = printSummaryInfo;
//# sourceMappingURL=info.js.map