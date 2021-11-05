"use strict";
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
    async run(terminal, _args) {
        terminal.log(await core_1.Component.getInfoAll(components_1.components));
    },
};
exports.solidityCreateCommand = {
    name: "create",
    title: "Create Solidity Contract",
    args: [{
            isArg: true,
            name: "name",
            title: "Contract Name",
            type: "string",
            defaultValue: "Contract",
        }, {
            name: "folder",
            type: "folder",
            title: "Target folder (current is default)",
        }],
    async run(terminal, args) {
        const filePath = (0, utils_1.uniqueFilePath)(args.folder, `${args.name}{}.sol`);
        const text = snippets_1.BasicContract.split("{name}").join(args.name);
        (0, utils_1.writeTextFile)(filePath, text);
        terminal.log(`Solidity contract ${path_1.default.basename(filePath)} created.`);
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
    ],
    async run(terminal, args) {
        var _a, _b;
        const ext = path_1.default.extname(args.file);
        if (ext !== ".sol") {
            terminal.log(`Choose solidity source file.`);
            return;
        }
        await core_1.Component.ensureInstalledAll(terminal, components_1.components);
        const fileDir = path_1.default.dirname(args.file);
        const fileName = path_1.default.basename(args.file);
        const outputDir = path_1.default.resolve((_a = args.outputDir) !== null && _a !== void 0 ? _a : ".");
        const preserveCode = args.code;
        const tvcName = path_1.default.resolve(outputDir, (0, utils_1.changeExt)(fileName, ".tvc"));
        const codeName = path_1.default.resolve(outputDir, (0, utils_1.changeExt)(fileName, ".code"));
        await components_1.components.compiler.silentRun(terminal, fileDir, ["-o", outputDir, fileName]);
        const linkerOut = await components_1.components.linker.silentRun(terminal, fileDir, ["compile", codeName, "--lib", components_1.components.stdlib.path()]);
        const generatedTvcName = `${(_b = /Saved contract to file (.*)$/mg.exec(linkerOut)) === null || _b === void 0 ? void 0 : _b[1]}`;
        // fs.renameSync was replaces by this code, because of an error: EXDEV: cross-device link not permitted
        await new Promise((res, rej) => (0, mv_1.default)(path_1.default.resolve(fileDir, generatedTvcName), path_1.default.resolve(outputDir, tvcName), {
            mkdirp: true,
            clobber: true,
        }, (err) => (err ? rej(err) : res(true))));
        if (!preserveCode)
            fs_1.default.unlinkSync(path_1.default.resolve(fileDir, codeName));
    },
};
exports.solidityAstCommand = {
    name: "ast",
    title: "AST of all source files in a JSON or compact-JSON format type",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\.sol$/i,
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
        }
    ],
    async run(terminal, args) {
        var _a;
        const ext = path_1.default.extname(args.file);
        if (ext !== ".sol") {
            terminal.log(`Choose solidity source file.`);
            return;
        }
        if (args.format.match(/^(compact-json|json)$/i) == null) {
            terminal.log(`Wrong ast format.`);
            return;
        }
        await core_1.Component.ensureInstalledAll(terminal, components_1.components);
        const fileDir = path_1.default.dirname(args.file);
        const fileName = path_1.default.basename(args.file);
        const outputDir = path_1.default.resolve((_a = args.outputDir) !== null && _a !== void 0 ? _a : ".");
        delete args.outputDir;
        const astName = path_1.default.resolve(outputDir, (0, utils_1.changeExt)(fileName, ".ast.json"));
        let astJson = await components_1.components.compiler.silentRun(terminal, fileDir, [`--ast-${args.format}`, fileName]);
        (0, utils_1.writeTextFile)(astName, astJson);
    },
};
exports.solidityUpdateCommand = {
    name: "update",
    title: "Update Solidity Compiler",
    args: [{
            name: "force",
            alias: "f",
            title: "Force reinstall even if up to date",
            type: "boolean",
            defaultValue: "false",
        }],
    async run(terminal, args) {
        await core_1.Component.updateAll(terminal, args.force, components_1.components);
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
            name: "stdlib",
            alias: "s",
            title: "Stdlib version (version number or `latest`)",
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
    async run(terminal, args) {
        const versions = {};
        if (args.compiler !== "") {
            versions.compiler = args.compiler;
        }
        if (args.linker !== "") {
            versions.linker = args.linker;
        }
        if (args.stdlib !== "") {
            versions.stdlib = args.stdlib;
        }
        await core_1.Component.setVersions(terminal, args.force, components_1.components, versions);
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