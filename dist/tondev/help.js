"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printUsage = void 0;
const core_1 = require("../core");
const utils_1 = require("../core/utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const controllers_1 = require("../controllers");
async function printCommandUsage(terminal, controller, command) {
    var _a, _b;
    let usageArgs = "";
    const options = [];
    const args = [];
    for (const arg of (_a = command.args) !== null && _a !== void 0 ? _a : []) {
        if (arg.isArg) {
            usageArgs += ` ${arg.name}`;
            args.push(arg);
        }
        else {
            options.push(arg);
        }
    }
    if (options.length > 0) {
        usageArgs += ` [options]`;
    }
    terminal.log(`Use: tondev ${controller.name} ${command.name}${usageArgs}`);
    if (args.length > 0) {
        terminal.log("Args:");
        terminal.log((0, utils_1.formatTable)(args.map(x => ["  ", x.name, x.title])));
    }
    terminal.log("Options:");
    const optionsTable = [["  ", "--help, -h", "Show command usage"]];
    for (const option of options) {
        optionsTable.push([
            "  ",
            (0, core_1.nameInfo)(option, "--", "-"),
            (_b = option.title) !== null && _b !== void 0 ? _b : "",
        ]);
        if (option.description) {
            (0, utils_1.breakWords)(option.description, 60).split("\n").forEach((line) => {
                optionsTable.push(["", "", line]);
            });
        }
        const variants = await (0, core_1.getArgVariants)(option);
        if (variants) {
            optionsTable.push(["", "", "Variants:"]);
            (0, utils_1.formatTable)(variants.map(x => [x.value, x.description])).split("\n").forEach(line => {
                optionsTable.push(["", "", line]);
            });
        }
    }
    terminal.log((0, utils_1.formatTable)(optionsTable));
}
function printControllerUsage(terminal, controller) {
    terminal.log((0, utils_1.formatTable)(controller.commands.map(x => ["  ", (0, core_1.nameInfo)(x), x.title])));
}
async function printUsage(terminal, controller, command) {
    var _a, _b;
    const pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "..", "..", "package.json"), "utf8"));
    terminal.log(`TONDev Version: ${pkg.version}`);
    if (controller && command) {
        await printCommandUsage(terminal, controller, command);
        return;
    }
    terminal.log(`Use: tondev ${(_a = controller === null || controller === void 0 ? void 0 : controller.name) !== null && _a !== void 0 ? _a : "tool"} ${(_b = command === null || command === void 0 ? void 0 : command.name) !== null && _b !== void 0 ? _b : "command"} args [options]`);
    terminal.log(`Options:`);
    terminal.log(`    --help, -h  Show command usage`);
    if (controller) {
        terminal.log("Commands:");
        printControllerUsage(terminal, controller);
        return;
    }
    terminal.log("Tools:");
    const rows = [];
    controllers_1.controllers.forEach((controller) => {
        var _a;
        rows.push(["  ", (0, core_1.nameInfo)(controller), (_a = controller.title) !== null && _a !== void 0 ? _a : ""]);
    });
    terminal.log((0, utils_1.formatTable)(rows));
}
exports.printUsage = printUsage;
//# sourceMappingURL=help.js.map