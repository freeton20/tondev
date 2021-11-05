"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clang = exports.clangSetCommand = exports.clangUpdateCommand = exports.clangCompileCommand = exports.clangCreateCommand = exports.clangVersionCommand = void 0;
const core_1 = require("../../core");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../core/utils");
const fs_1 = __importDefault(require("fs"));
const snippets_1 = require("./snippets");
const components_1 = require("./components");
exports.clangVersionCommand = {
    name: "version",
    title: "Show C++ Compiler Version",
    async run(terminal, _args) {
        terminal.log(await core_1.Component.getInfoAll(components_1.components));
    },
};
exports.clangCreateCommand = {
    name: "create",
    title: "Create C++ Contract",
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
            title: "Target folder (should exist, current by default)",
        },
    ],
    async run(terminal, args) {
        // filename was entered with an extension, delete it
        args.name = args.name.replace(/.cpp$/, "");
        const hFilePath = (0, utils_1.uniqueFilePath)(args.folder, `${args.name}{}.hpp`);
        const cFilePath = (0, utils_1.uniqueFilePath)(args.folder, `${args.name}{}.cpp`);
        (0, utils_1.writeTextFile)(hFilePath, snippets_1.BasicContractHeaders);
        (0, utils_1.writeTextFile)(cFilePath, snippets_1.BasicContractCode.split("{name}").join(hFilePath));
        terminal.log(`${hFilePath} created.`);
        terminal.log(`${cFilePath} created.`);
    },
};
exports.clangCompileCommand = {
    name: "compile",
    title: "Compile C++ Contract",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\.cpp$/i,
        },
    ],
    async run(terminal, args) {
        const ext = path_1.default.extname(args.file);
        if (ext !== ".cpp") {
            terminal.log(`Choose source file.`);
            return;
        }
        await core_1.Component.ensureInstalledAll(terminal, components_1.components);
        const tvcName = (0, utils_1.changeExt)(args.file, ".tvc");
        const generatedAbiName = (0, utils_1.changeExt)(args.file, ".abi");
        const renamedAbiName = (0, utils_1.changeExt)(args.file, ".abi.json");
        await components_1.components.compiler.run(terminal, path_1.default.dirname(args.file), // cd to this directory
        [args.file, "-o", tvcName]);
        fs_1.default.renameSync(generatedAbiName, renamedAbiName);
        terminal.log(`Success, files created: ${tvcName}, ${renamedAbiName}`);
    },
};
exports.clangUpdateCommand = {
    name: "update",
    title: "Update C++ Compiler",
    args: [
        {
            name: "force",
            alias: "f",
            title: "Force reinstall even if up to date",
            type: "boolean",
            defaultValue: "false",
        },
    ],
    async run(terminal, args) {
        await core_1.Component.updateAll(terminal, args.force, components_1.components);
    },
};
exports.clangSetCommand = {
    name: "set",
    title: "Change C++ Compiler Config",
    args: [
        {
            name: "compiler",
            alias: "c",
            title: "Compiler version (version number or `latest`)",
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
        await core_1.Component.setVersions(terminal, args.force, components_1.components, versions);
    },
};
exports.Clang = {
    name: "clang",
    title: "C++ compiler",
    commands: [
        exports.clangCreateCommand,
        exports.clangCompileCommand,
        exports.clangVersionCommand,
        exports.clangSetCommand,
        exports.clangUpdateCommand,
    ],
};
//# sourceMappingURL=index.js.map