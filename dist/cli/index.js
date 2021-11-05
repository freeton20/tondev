"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.missingArgError = void 0;
const core_1 = require("../core");
const controllers_1 = require("../controllers");
const utils_1 = require("../core/utils");
const help_1 = require("../tondev/help");
const info_1 = require("../tondev/info");
const process = __importStar(require("process"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function findOptionArg(command, name) {
    var _a, _b;
    if (name.startsWith("--")) {
        name = name.substr(2).toLowerCase();
        return (_a = command.args) === null || _a === void 0 ? void 0 : _a.find(x => !x.isArg && x.name === name);
    }
    if (name.startsWith("-")) {
        name = name.substr(1).toLowerCase();
        return (_b = command.args) === null || _b === void 0 ? void 0 : _b.find(x => !x.isArg && x.alias === name);
    }
    return undefined;
}
class CommandLine {
    constructor() {
        this.args = {};
        this.controller = undefined;
        this.command = undefined;
        this.positional = [];
        this.unresolved = new Map();
        this.pending = undefined;
        this.printSummaryInfo = false;
    }
    setArgValue(arg, value) {
        const name = arg.name
            .split("-")
            .map((x, i) => i > 0 ? (x.substr(0, 1).toUpperCase() + x.substr(1)) : x)
            .join("");
        this.args[name] = value;
    }
    async resolveValue(arg, value) {
        if (arg.type === "boolean" && value === undefined) {
            value = "true";
        }
        if (value === undefined) {
            throw new Error(`Missing value for ${arg.name}`);
        }
        let resolved;
        if (arg.type === "boolean") {
            resolved = value.toLowerCase() === "true";
        }
        else {
            resolved = value;
        }
        const variants = await (0, core_1.getArgVariants)(arg);
        if (variants && !variants.find(x => x.value === value)) {
            throw await missingArgError(arg);
        }
        this.setArgValue(arg, resolved);
        this.unresolved.delete(arg.name);
        const i = this.positional.indexOf(arg);
        if (i >= 0) {
            this.positional.splice(i, 1);
        }
        if (this.pending === arg) {
            this.pending = undefined;
        }
    }
    async resolveDefault(arg) {
        if (arg.defaultValue !== undefined) {
            this.setArgValue(arg, arg.type === "boolean" ? arg.defaultValue === "true" : arg.defaultValue);
        }
        else if (arg.type === "folder") {
            this.setArgValue(arg, process.cwd());
        }
        else {
            throw await missingArgError(arg);
        }
    }
    async parseOptionName(name) {
        if (this.pending) {
            await this.resolveValue(this.pending, undefined);
        }
        const optionName = name.toLowerCase();
        if (optionName === "--help" || optionName === "-h") {
            this.args.help = true;
        }
        else if (this.command) {
            this.pending = findOptionArg(this.command, optionName);
            if (!this.pending) {
                throw new Error(`Unknown option ${optionName}`);
            }
            if (this.pending.type === "boolean") {
                await this.resolveValue(this.pending, undefined);
            }
        }
        else if (this.controller) {
            throw new Error(`Unexpected option ${optionName} before command name.`);
        }
        else {
            throw new Error(`Unexpected option ${optionName} before tool name.`);
        }
    }
    setCommand(command) {
        var _a;
        this.command = command;
        for (const arg of (_a = this.command.args) !== null && _a !== void 0 ? _a : []) {
            this.unresolved.set(arg.name, arg);
            if (arg.isArg) {
                this.positional.push(arg);
            }
        }
    }
    async parse(programArgs) {
        for (let arg of programArgs) {
            if (arg.startsWith("-") && !this.pending) {
                await this.parseOptionName(arg);
            }
            else {
                arg = arg.trim();
                if (this.pending) {
                    await this.resolveValue(this.pending, arg);
                }
                else if (this.controller && this.command) {
                    if (this.positional.length === 0) {
                        throw new Error(`Unexpected argument ${arg}`);
                    }
                    await this.resolveValue(this.positional[0], arg);
                }
                else if (this.controller) {
                    const command = this.controller.commands.find(x => (0, core_1.matchName)(x, arg));
                    if (command) {
                        this.setCommand(command);
                    }
                    else {
                        throw new Error(`Unknown command: ${arg}`);
                    }
                }
                else {
                    this.controller = controllers_1.controllers.find(x => (0, core_1.matchName)(x, arg));
                    if (!this.controller) {
                        const byAlias = (0, controllers_1.findControllerAndCommandByAlias)(arg);
                        if (byAlias) {
                            this.controller = byAlias.controller;
                            this.setCommand(byAlias.command);
                        }
                        else if (arg.toLowerCase().trim() === "info") {
                            this.printSummaryInfo = true;
                            break;
                        }
                        else {
                            throw new Error(`Unknown tool: ${arg}.`);
                        }
                    }
                }
            }
        }
        if (this.pending) {
            await this.resolveValue(this.pending, undefined);
        }
        if (this.args.help || this.printSummaryInfo) {
            return;
        }
        for (const arg of this.unresolved.values()) {
            await this.resolveDefault(arg);
        }
    }
}
async function missingArgError(arg) {
    const variants = await (0, core_1.getArgVariants)(arg);
    const variantsString = variants
        ? "\n" +
            (0, utils_1.formatTable)([
                ["Available variants:", ""],
                ...variants.map(x => { var _a; return [x.value, (_a = x.description) !== null && _a !== void 0 ? _a : ""]; }),
            ], { headerSeparator: true })
        : "";
    throw new Error(`Missing required ${arg.name}${variantsString}`);
}
exports.missingArgError = missingArgError;
function isPrintVersionMode() {
    if (process.argv.length !== 3) {
        return false;
    }
    const opt = process.argv[2].toLowerCase();
    return opt === "--version" || opt === "-v";
}
async function run(terminal) {
    const parser = new CommandLine();
    if (isPrintVersionMode()) {
        const pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "..", "..", "package.json"), "utf8"));
        terminal.log(pkg.version);
        process.exit(0);
    }
    await parser.parse(process.argv.slice(2));
    if (parser.printSummaryInfo) {
        await (0, info_1.printSummaryInfo)(terminal);
        return;
    }
    const { controller, command, args, } = parser;
    if (!controller || !command) {
        await (0, help_1.printUsage)(terminal, controller, command);
        return;
    }
    if (parser.args.help) {
        await (0, help_1.printUsage)(terminal, controller, command);
        return;
    }
    await command.run(terminal, args);
}
exports.run = run;
//# sourceMappingURL=index.js.map