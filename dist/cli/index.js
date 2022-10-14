"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.run = exports.missingArgError = exports.CommandLine = void 0;
/* eslint-disable @typescript-eslint/no-empty-function */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const process = __importStar(require("process"));
const core_1 = require("../core");
const controllers_1 = require("../controllers");
const utils_1 = require("../core/utils");
const help_1 = require("../everdev/help");
const info_1 = require("../everdev/info");
const checkNewVersion_1 = require("../everdev/checkNewVersion");
function findOptionArg(command, name) {
    var _a, _b;
    if (name.startsWith("--")) {
        name = name.substring(2).toLowerCase();
        return (_a = command.args) === null || _a === void 0 ? void 0 : _a.find(x => !x.isArg && x.name === name);
    }
    if (name.startsWith("-")) {
        name = name.substring(1).toLowerCase();
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
            .map((x, i) => i > 0 ? x.substring(0, 1).toUpperCase() + x.substring(1) : x)
            .join("");
        if (typeof value === "string") {
            const prevVal = this.args[name];
            if (prevVal) {
                this.args[name] = prevVal + " " + value;
            }
            else {
                this.args[name] = value;
            }
        }
        else {
            this.args[name] = value;
        }
    }
    resolveValue(arg, value) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const variants = yield (0, core_1.getArgVariants)(arg);
            if (variants && !variants.find(x => x.value === value)) {
                throw yield missingArgError(arg);
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
        });
    }
    resolveDefault(arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (arg.defaultValue !== undefined) {
                this.setArgValue(arg, arg.type === "boolean"
                    ? arg.defaultValue === "true"
                    : arg.defaultValue);
            }
            else if (arg.type === "folder") {
                this.setArgValue(arg, process.cwd());
            }
            else {
                throw yield missingArgError(arg);
            }
        });
    }
    parseOptionName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pending) {
                yield this.resolveValue(this.pending, undefined);
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
                    yield this.resolveValue(this.pending, undefined);
                }
            }
            else if (this.controller) {
                throw new Error(`Unexpected option ${optionName} before command name.`);
            }
            else {
                throw new Error(`Unexpected option ${optionName} before tool name.`);
            }
        });
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
    parse(programArgs) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < programArgs.length; i++) {
                let arg = programArgs[i];
                if (arg.startsWith("-") && !this.pending) {
                    yield this.parseOptionName(arg);
                }
                else {
                    arg = arg.trim();
                    if (this.pending) {
                        yield this.resolveValue(this.pending, arg);
                    }
                    else if (this.controller && this.command) {
                        if (this.positional.length === 0 &&
                            this.greedyArgument === undefined) {
                            throw new Error(`Unexpected argument ${arg}`);
                        }
                        if ((_a = this.positional[0]) === null || _a === void 0 ? void 0 : _a.greedy) {
                            this.greedyArgument = this.positional[0];
                        }
                        yield this.resolveValue(this.positional[0] || this.greedyArgument, arg);
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
                yield this.resolveValue(this.pending, undefined);
            }
            if (this.args.help || this.printSummaryInfo) {
                return;
            }
            for (const arg of this.unresolved.values()) {
                yield this.resolveDefault(arg);
            }
        });
    }
}
exports.CommandLine = CommandLine;
function missingArgError(arg) {
    return __awaiter(this, void 0, void 0, function* () {
        const variants = yield (0, core_1.getArgVariants)(arg);
        const variantsString = variants
            ? "\n" +
                (0, utils_1.formatTable)([
                    ["Available variants:", ""],
                    ...variants.map(x => { var _a; return [x.value, (_a = x.description) !== null && _a !== void 0 ? _a : ""]; }),
                ], { headerSeparator: true })
            : "";
        throw new Error(`Missing required ${arg.name}${variantsString}`);
    });
}
exports.missingArgError = missingArgError;
function isPrintVersionMode() {
    if (process.argv.length !== 3) {
        return false;
    }
    const opt = process.argv[2].toLowerCase();
    return opt === "--version" || opt === "-v";
}
function run(terminal) {
    return __awaiter(this, void 0, void 0, function* () {
        const parser = new CommandLine();
        const pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "..", "..", "package.json"), "utf8"));
        // Once a day, create a file containing the latest version number of `everdev`
        // Ignoring any (network, concurent access to file, etc) errors
        (0, checkNewVersion_1.createLatestVerFile)(pkg.name).catch(() => { });
        const msg = (0, checkNewVersion_1.getUpdateIsAvailableMsg)(pkg.name, pkg.version);
        if (msg !== "") {
            terminal.log(chalk_1.default.yellow(msg));
        }
        if (isPrintVersionMode()) {
            terminal.log(pkg.version);
            return;
        }
        yield parser.parse(process.argv.slice(2));
        if (parser.printSummaryInfo) {
            yield (0, info_1.printSummaryInfo)(terminal);
            return;
        }
        const { controller, command, args } = parser;
        if (!controller || !command) {
            yield (0, help_1.printUsage)(terminal, controller, command);
            return;
        }
        if (parser.args.help) {
            yield (0, help_1.printUsage)(terminal, controller, command);
            return;
        }
        yield command.run(terminal, args);
    });
}
exports.run = run;
//# sourceMappingURL=index.js.map