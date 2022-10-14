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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printSummaryInfo = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
function printSummaryInfo(terminal) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "..", "..", "package.json"), "utf8"));
        terminal.log();
        terminal.log(`${pkg.name} version: ${pkg.version}`);
        for (const controller of controllers_1.controllers) {
            const info = (_b = (_a = findInfoCommand(controller, "info")) !== null && _a !== void 0 ? _a : findInfoCommand(controller, "list")) !== null && _b !== void 0 ? _b : findInfoCommand(controller, "version");
            if (info) {
                terminal.log();
                terminal.log(controller.title);
                terminal.log();
                try {
                    yield info.command.run(terminal, info.args);
                }
                catch (error) {
                    terminal.writeError(`${error}`);
                }
            }
        }
        terminal.log();
    });
}
exports.printSummaryInfo = printSummaryInfo;
//# sourceMappingURL=info.js.map