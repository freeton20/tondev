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
exports.Solidity = exports.soliditySetCommand = exports.solidityUpdateCommand = exports.solidityAstCommand = exports.solidityCompileCommand = exports.solidityCreateCommand = exports.solidityVersionCommand = void 0;
const core_1 = require("../../core");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../core/utils");
const fs_1 = __importDefault(require("fs"));
const mv_1 = __importDefault(require("mv"));
const snippets_1 = require("./snippets");
const components_1 = require("./components");
exports.solidityVersionCommand = {
    name: "version",
    title: "Show Solidity Version",
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            terminal.log(yield core_1.Component.getInfoAll(components_1.components));
        });
    },
};
exports.solidityCreateCommand = {
    name: "create",
    title: "Create Solidity Contract",
    args: [
        {
            isArg: true,
            name: "name",
            title: "Contract Name",
            type: "string",
            defaultValue: "Contract",
        },
        {
            name: "folder",
            type: "folder",
            title: "Target folder (current is default)",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = (0, utils_1.uniqueFilePath)(args.folder, `${args.name}{}.sol`);
            const text = snippets_1.BasicContract.split("{name}").join(args.name);
            (0, utils_1.writeTextFile)(filePath, text);
            terminal.log(`Solidity contract ${path_1.default.basename(filePath)} created.`);
        });
    },
};
exports.solidityCompileCommand = {
    name: "compile",
    title: "Compile Solidity Contract",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\.sol$/i,
            greedy: true,
        },
        {
            name: "code",
            alias: "c",
            title: "Save .code file (false is default)",
            type: "boolean",
            defaultValue: "false",
        },
        {
            name: "output-dir",
            alias: "o",
            type: "folder",
            title: "Output folder (current is default)",
            defaultValue: "",
        },
        {
            name: "include-path",
            alias: "i",
            type: "folder",
            title: "Additional path(s) for inputs (node_modules is default)",
            defaultValue: "node_modules",
        },
    ],
    run(terminal, args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield core_1.Component.ensureInstalledAll(terminal, components_1.components);
            for (const file of args.file.split(" ")) {
                const fileDir = path_1.default.dirname(file);
                const fileName = path_1.default.basename(file);
                const outputDir = path_1.default.resolve((_a = args.outputDir) !== null && _a !== void 0 ? _a : ".");
                const includePath = args.includePath
                    ? args.includePath
                        .split(",")
                        .map(p => path_1.default.resolve(p))
                        .join(" -i ")
                        .split(" ")
                    : [path_1.default.resolve("node_modules")];
                const preserveCode = args.code;
                const tvcName = path_1.default.resolve(outputDir, (0, utils_1.changeExt)(fileName, ".tvc"));
                const abiName = path_1.default.resolve(outputDir, (0, utils_1.changeExt)(fileName, ".abi.json"));
                const codeName = path_1.default.resolve(outputDir, (0, utils_1.changeExt)(fileName, ".code"));
                const isDeprecatedVersion = (yield components_1.components.compiler.getCurrentVersion()) <= "0.21.0";
                let linkerOut;
                if (isDeprecatedVersion) {
                    terminal.log("You use an obsolete version of the compiler.\nThe output files are saved in the current directory");
                    yield components_1.components.compiler.silentRun(terminal, fileDir, [
                        fileName,
                    ]);
                    linkerOut = yield components_1.components.linker.silentRun(terminal, fileDir, [
                        "compile",
                        codeName,
                        "-a",
                        abiName,
                        "--lib",
                        components_1.components.stdlib.path(),
                    ]);
                }
                else {
                    yield components_1.components.compiler.silentRun(terminal, fileDir, [
                        "-o",
                        outputDir,
                        "-i",
                        ...includePath,
                        fileName,
                    ]);
                    linkerOut = yield components_1.components.linker.silentRun(terminal, fileDir, ["compile", codeName, "--lib", components_1.components.stdlib.path()]);
                }
                const generatedTvcName = `${(_b = /Saved contract to file (.*)$/gm.exec(linkerOut)) === null || _b === void 0 ? void 0 : _b[1]}`;
                // fs.renameSync was replaces by this code, because of an error: EXDEV: cross-device link not permitted
                yield new Promise((res, rej) => (0, mv_1.default)(path_1.default.resolve(fileDir, generatedTvcName), path_1.default.resolve(outputDir, tvcName), {
                    mkdirp: true,
                    clobber: true,
                }, (err) => (err ? rej(err) : res(true))));
                if (!preserveCode) {
                    fs_1.default.unlinkSync(path_1.default.resolve(fileDir, codeName));
                }
            }
        });
    },
};
exports.solidityAstCommand = {
    name: "ast",
    title: "AST of all source files in a JSON or compact-JSON format.",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\.sol$/i,
            greedy: true,
        },
        {
            name: "format",
            alias: "f",
            type: "string",
            title: "-f, --format <json | compact-json>",
            defaultValue: "compact-json",
        },
        {
            name: "output-dir",
            alias: "o",
            type: "folder",
            title: "Output folder (current is default)",
            defaultValue: "",
        },
        {
            name: "include-path",
            alias: "i",
            type: "folder",
            title: "Additional path(s) for inputs (node_modules is default)",
            defaultValue: "node_modules",
        },
    ],
    run(terminal, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (const file of args.file.split(" ")) {
                const ext = path_1.default.extname(file);
                if (ext !== ".sol") {
                    terminal.log(`Choose solidity source file.`);
                    return;
                }
                if (args.format.match(/^(compact-json|json)$/i) == null) {
                    terminal.log(`Wrong ast format.`);
                    return;
                }
                yield core_1.Component.ensureInstalledAll(terminal, components_1.components);
                const fileDir = path_1.default.dirname(file);
                const fileName = path_1.default.basename(file);
                args.outputDir = path_1.default.resolve((_a = args.outputDir) !== null && _a !== void 0 ? _a : ".");
                const includePath = args.includePath
                    ? args.includePath
                        .split(",")
                        .map(p => path_1.default.resolve(p))
                        .join(" -i ")
                        .split(" ")
                    : [path_1.default.resolve("node_modules")];
                yield components_1.components.compiler.silentRun(terminal, fileDir, [
                    `--ast-${args.format}`,
                    "--output-dir",
                    args.outputDir,
                    "--include-path",
                    ...includePath,
                    fileName,
                ]);
            }
        });
    },
};
exports.solidityUpdateCommand = {
    name: "update",
    title: "Update Solidity Compiler",
    args: [
        {
            name: "force",
            alias: "f",
            title: "Force reinstall even if up to date",
            type: "boolean",
            defaultValue: "false",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield core_1.Component.updateAll(terminal, args.force, components_1.components);
        });
    },
};
exports.soliditySetCommand = {
    name: "set",
    title: "Change Solidity Config",
    args: [
        {
            name: "compiler",
            alias: "c",
            title: "Compiler version (version number or `latest`)",
            type: "string",
            defaultValue: "",
        },
        {
            name: "linker",
            alias: "l",
            title: "Linker version (version number or `latest`)",
            type: "string",
            defaultValue: "",
        },
        {
            name: "force",
            alias: "f",
            title: "Force reinstall even if up to date",
            type: "boolean",
            defaultValue: "false",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const versions = {};
            if (args.compiler !== "") {
                versions.compiler = args.compiler;
                versions.stdlib = args.compiler;
            }
            if (args.linker !== "") {
                versions.linker = args.linker;
            }
            yield core_1.Component.setVersions(terminal, args.force, components_1.components, versions);
        });
    },
};
exports.Solidity = {
    name: "sol",
    title: "Solidity Compiler",
    commands: [
        exports.solidityCreateCommand,
        exports.solidityCompileCommand,
        exports.solidityAstCommand,
        exports.solidityVersionCommand,
        exports.soliditySetCommand,
        exports.solidityUpdateCommand,
    ],
};
//# sourceMappingURL=index.js.map